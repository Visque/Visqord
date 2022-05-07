const express = require("express");
const session = require("express-session");
const crypto = require("../encryption/encryption");
const mongoose = require("mongoose");

const app = express.Router();

// Database
const userModel = require("../database/models/users");
const channelModel = require("../database/models/channels");
const userChannelModel = require("../database/models/userChannels");
const postModel = require("../database/models/posts");
const inviteNotifModel = require("../database/models/notifications");
const friendModel = require("../database/models/friends");

// MiddleWares
app.use(express.json());
app.use(express.urlencoded());

// Sockets

const io = require("../main.js");

io.on("connection", (socket) => {
  socket.on("join user", (obj) => {
    console.log(`user joined: user-${obj.userName}`);
    socket.join(`user-${obj.userName}`);
  });

  socket.on("send notification", (data) => {
    // console.log(`sending notif to ${data}`, data, `user-${data.userName}`);
    if (data.type == 1) {
      io.to(`user-${data.to}`).emit("friend request", {
        notifId: data.notifId,
        type: data.type,
        to: data.to,
        from: data.from,
      });
    }
  });
});

// Routing

app.route("/").get((req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/auth");
    return;
  }
  var userId = req.session.userId;
  var userName = req.session.userName;
  findUser({ _id: userId }, function (user) {
    if (user.status !== 0) {
      // User is Authenticated :)
      var context = {};
      getUserChannels(userId, function (channels) {
        // User channels
        getUserPosts(userId, function (posts) {
          // user posts
          sortChannelsToUserPosts(userId, channels, function (channels) {
            // sorting channels
            trendingChannels(function (trendingChannels) {
              // trending channels
              trendingUsers(function (trendingUsers) {
                // trending users
                trendingTags(function (trendingTags) {
                  // trending tags
                  trendingRegions(function (trendingRegions) {
                    // trending Regions
                    context.user = {
                      userId: userId,
                      userName: userName,
                    };

                    context.channels = channels;
                    context.posts = posts;

                    context.selector = {};
                    context.selector.type = "dashboard";
                    context.selector.dashboard = {};
                    context.selector.dashboard.trendingChannels =
                      trendingChannels;
                    context.selector.dashboard.trendingUsers = trendingUsers;
                    context.selector.dashboard.trendingTags = trendingTags;
                    context.selector.dashboard.trendingRegions =
                      trendingRegions;

                    getUserNotifs(userId, function (notifs) {
                      // user notifs
                      // console.log("testing notifs: ",context.notifs);

                      context.notifs = notifs;

                      getUserFriends(userId, function (friendList) {
                        // user FriendList
                        console.log("friendList:", friendList);
                        context.friends = friendList;
                        res.render("home.ejs", context);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    } else {
      res.redirect("/auth");
    }
  });
});

app.route("/logout").get((req, res) => {
  // TODO: set user status to offline
  if (!req.session.isLoggedIn) {
    res.redirect("/auth");
    return;
  }
  setUserStatus(req.session.userId, 0, function () {
    req.session.destroy();
    res.redirect("/auth");
  });
});

// Functions

function getUserNotifs(userId, callback) {
  inviteNotifModel
    .aggregate([
      {
        $match: {
          to: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "from",
          foreignField: "_id",
          as: "from",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "to",
          foreignField: "_id",
          as: "to",
        },
      },
    ])
    .then((notifs) => {
      notifs.forEach((notif) => {
        notif.to = notif.to[0];
        notif.from = notif.from[0];
      });
      callback(notifs);
    });
}

function trendingChannels(callback) {
  postModel
    .aggregate([
      {
        $group: {
          _id: "$channelId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "channels",
          localField: "_id",
          foreignField: "_id",
          as: "channel",
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 5,
      },
    ])
    .then((trendingPosts) => {
      trendingPosts.forEach((trendingPost) => {
        trendingPost.channel = trendingPost.channel[0];
      });
      callback(trendingPosts);
    });
}

function trendingTags(callback) {
  channelModel
    .aggregate([
      {
        $unwind: {
          path: "$tags",
        },
      },
      {
        $group: {
          _id: "$tags",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 5,
      },
    ])
    .then((tags) => {
      callback(tags);
    });
}

function trendingRegions(callback) {
  userModel
    .aggregate([
      {
        $match: {
          status: 1,
        },
      },
      {
        $group: {
          _id: "$region",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 5,
      },
    ])
    .then((trendingRegions) => {
      callback(trendingRegions);
    });
}

function trendingUsers(callback) {
  postModel
    .aggregate([
      {
        $group: {
          _id: "$createdBy",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
    ])
    .limit(5)
    .then((trendingUsers) => {
      trendingUsers.forEach((trendingUser) => {
        trendingUser.user = trendingUser.user[0];
      });
      callback(trendingUsers);
    });
}

function findUser(condition, callback) {
  userModel.findOne(condition).then((user) => {
    callback(user);
  });
}

function getUserChannels(userId, callback) {
  {
    // Resolved
    userChannelModel
      .find({ userId: userId })
      .populate("channelId")
      .then((userChannels) => {
        let channels = [];
        userChannels.forEach((userChannel) => {
          channels.push(userChannel.channelId);
        });
        callback(channels);
      });
  }
}

function getUserPosts(userId, callback) {
  postModel
    .find({ createdBy: userId })
    .populate("createdBy")
    .then((postList) => {
      callback(postList);
    });
}

function getUserFriends(userId, callback) {
  friendModel
    .aggregate([
      {
        $match: {
          $or: [
            {
              friendOne: mongoose.Types.ObjectId(userId),
            },
            {
              friendTwo: mongoose.Types.ObjectId(userId),
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "friendOne",
          foreignField: "_id",
          as: "friendOne",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "friendTwo",
          foreignField: "_id",
          as: "friendTwo",
        },
      },
    ])
    .then((friendList) => {
      friendList.forEach((friend) => {
        friend.friendOne = friend.friendOne[0];
        friend.friendTwo = friend.friendTwo[0];
      });
      callback(friendList);
    });
}

function sortChannelsToUserPosts(userId, channels, callback) {
  // console.log("sorting :)");
  let map = [];
  if (!channels.length) callback([]);
  channels.forEach((channel) => {
    // console.log("Entry channels :)");
    postModel
      .find({ createdBy: userId, channelId: channel._id })
      .populate("channelId")
      .then((posts) => {
        // console.log("Entry post :)");
        map.push({ channel: channel, userChannelPostCount: posts.length });
        if (map.length == channels.length) {
          // console.log('user channels posts b4: ', map)
          bubbleSort(map);
          map.sort((a, b) => a.userChannelPostCount > b.userChannelPostCount);
          // console.log('user channels posts a4: ', map)

          let sortedChannels = [];
          map.forEach((item) => {
            sortedChannels.push(item.channel);
          });
          // console.log("user channels posts a4: ", map);
          callback(sortedChannels);
        }
      });
  });
}

function bubbleSort(arr) {
  // sorts the array of objects to userChannelPostCount key
  var swapped;

  do {
    swapped = false;

    for (var i = 0; i < arr.length - 1; i++) {
      if (arr[i].userChannelPostCount < arr[i + 1].userChannelPostCount) {
        var temp = arr[i];

        arr[i] = arr[i + 1];
        arr[i + 1] = temp;

        swapped = true;
      }
    }
  } while (swapped);
}

function setUserStatus(userId, status, callback) {
  userModel.updateOne({ _id: userId }, { status: status }).then(() => {
    callback();
  });
}

module.exports = app;

// get notif id for accept and reject functions calls :(
