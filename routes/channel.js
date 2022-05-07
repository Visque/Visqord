const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express.Router();

const crypto = require("../encryption/encryption");

// Database
const userChannelModel = require("../database/models/userChannels");
const channelModel = require("../database/models/channels");
const postModel = require("../database/models/posts");
const userModel = require("../database/models/users");
const inviteNotifModel = require("../database/models/notifications");
const friendModel = require("../database/models/friends");


// MiddleWares
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded());

// Sockets

const io = require("../main.js");
// console.log('log sock: ', io)

io.on("connection", (socket) => {
  // console.log('log sock: ', socket)
  socket.on("join channel", (obj) => {
    console.log(`user joined a channel`);
    socket.join(`chanel-${obj.channelId}`);
  });

  socket.on("new message", (data) => {
    socket.join(data.channelId);
    // console.log("send to channel: ", data);
    io.to(`chanel-${data.channelId}`).emit("send message", {
      message: data.message,
      userName: data.userName,
      userId: data.userId,
      channelId: data.channelId,
    });
  });

  socket.on("new user", (usr) => {
    socket.username = usr;
    io.emit("send message", {
      message: `${socket.username} has joined the chat`,
      user: "Welcome Bot",
    });
  });
});

// Routing

app
  .route("/")
  .get((req, res) => {
    res.redirect("/");
  })
  .post((req, res) => {
    var userId = req.session.userId;
    var channelData = req.body;
    channelData.createdBy = userId;
    // console.log(channelData)

    saveChannel(channelData, function (channelId) {
      // console.log("channel Saved succesfully");
      addUserChannel(userId, channelId, function () {
        // console.log("channel added to usersChannel");
        res.end();
      });
    });
  });

app.route("/:channelId").get((req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/");
    return;
  }
  var channelId = req.params.channelId;
  var userId = req.session.userId;
  var userName = req.session.userName;

  // console.log("decrypted channel id: ", channelId);
  var context = {};
  getUserChannels(userId, function (channels) {
    // console.log("user channels: ", channels)

    getChannelPosts(channelId, function (posts) {
      sortChannelsToUserPosts(userId, channels, function (channels) {
        // console.log("channel posts: ", posts);
        posts.sort((a, b) => a.createdAt < b.createdAt);

        context.channels = channels;
        context.user = { userId: userId, userName: userName };
        context.posts = posts;

        context.selector = channels.filter((channel) => {
          return channel._id == channelId;
        })[0];

        // console.log("channels/ context: ", context);

        getUserNotifs(userId, function (notifs) {
          context.notifs = notifs;

          getUserFriends(userId, function (friendList) {
            // user FriendList
            context.friends = friendList;
            res.render("home.ejs", context);
          });
        });
      });
    });
  });
});

app.route("/invite/:channelId").get((req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/");
    return;
  }

  // var channelId = crypto.decrypt(req.params.channelId);
  // var userId = crypto.decrypt(req.params.userId);
  var userId = req.session.userId;
  var channelId = req.params.channelId; // Decrypt

  getUserChannels(userId, function (channels) {
    check = channels.filter((channel) => {
      return channel._id == channelId;
    });

    if (check.length) {
      res.status(400);
      res.end("/");
      return;
    } else {
      addUserChannel(userId, channelId, function () {
        // console.log("added user to channel :)");
        res.end("/");
      });
    }
  });
});

// Functions

function saveChannel(newChannel, callback) {
  channelModel.create(newChannel).then((channel) => {
    // console.log("logging channel: ", channel);
    callback(channel._id);
  });
}

function addUserChannel(userId, channelId, callback) {
  // Resolved
  userChannelModel.create({ userId: userId, channelId: channelId }).then(() => {
    callback();
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
        notif.from = notif.from[0];
      });
      callback(notifs);
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

function getChannelPosts(channelId, callback) {
  postModel
    .aggregate([
      {
        $match: {
          channelId: mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
    ])
    .then((postList) => {
      postList;
      postList.forEach((post) => {
        post.createdBy = post.createdBy[0];
      });
      // console.log("aggregate: ", postList);
      callback(postList);
    });
}

function sortChannelsToUserPosts(userId, channels, callback) {
  // console.log("sorting :)");
  let map = [];
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

function findUser(condition, callback) {
  userModel.findOne(condition).then((user) => {
    callback(user);
  });
}

module.exports = app;
