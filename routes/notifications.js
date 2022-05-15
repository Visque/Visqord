const express = require("express");
const session = require("express-session");

const app = express.Router();

// Database
const db = require("../database");
const channelModel = require("../database/models/channels");
const userModel = require("../database/models/users");
const userChannelModel = require("../database/models/userChannels");
const inviteNotifModel = require("../database/models/notifications");
const friendModel = require("../database/models/friends");

// MiddleWares
// app.use(express.json());
// app.use(express.urlencoded());

app.route("/").post((req, res) => {
  let type = Number(req.body.type);
  let to = req.body.to;
  let from = req.session.userId;
  console.log("notif recieve check: ", req.body, from);

  findUser({ userName: to }, function (userObj) {
    console.log(userObj);
    if (!userObj || userObj._id == from) {
      res.status(400);
      res.end("No such user exists...");
      return;
    }

    if (type == 1) {
      findFriend({ one: userObj._id, two: from }, function (check) {
        if (check == true) {
          findNotif(
            { to: userObj._id, from: from, type: type },
            function (notifList) {
              console.log("notifList haha: ", notifList);
              if (!notifList.length) {
                let condition = {
                  type: type,
                  from: from,
                  to: userObj._id._id,
                };
                saveNotif(condition, function (notif) {
                  res.status(200).json(notif);
                });
              } else {
                res.status(400).end();
              }
            }
          );
        } else {
          res.status(400).end();
        }
      });
    } else if (type == 2) {
      let userObjId = userObj._id;
      let channelId = req.body.channelId;
      getUserChannels(userObjId, function (channels) {
        let exist = channels.filter((channel) => {
          return channel._id == channelId;
        });
        console.log("cgheck exists: ", exist);
        if (exist.length) {
          // if no such channel exists anymore :)
          res.status(400);
          console.log("channel already exists anymore...");
          res.end();
          return;
        } else {
          getChannelName(channelId, function (channelName) {
            findNotif(
              {
                to: userObj._id,
                from: from,
                channelId: channelId,
                type: type,
              },
              function (notifList) {
                console.log("notifList haha: ", notifList);
                if (!notifList.length) {
                  let condition = {
                    type: type,
                    from: from,
                    to: userObj._id,
                    channelId: channelId,
                  };
                  saveNotif(condition, function (notif) {
                    res.status(200).json(notif);
                  });
                } else {
                  res.status(400).end("Notif Already exists");
                }
              }
            );
          });
          // getChannelName(channelId, function(channelName){
          //   let condition = {
          //     type: type,
          //     from: from,
          //     to: userObj._id,
          //     channelId: channelId,
          //   };
          //   saveNotif(condition, function(notif){
          //     res.status(200).json(notif)
          //   });
          // })
        }
      });
    }
  });
});

app.route("/:notifId").delete((req, res) => {
  console.log("quert delete: ", req.params);
  let notifId = req.params.notifId;
  deleteNotif(notifId, function () {
    res.status(200).end();
  });
});

// Functions

// Finds and returns a single user from the DB
function findUser(condition, callback) {
  userModel.find(condition).then((userList) => {
    userList = userList[0];
    callback(userList);
  });
}

function findNotif(condition, callback) {
  inviteNotifModel.find(condition).then((notifList) => {
    callback(notifList);
  });
}

function findFriend(data, callback) {
  friendModel
    .find({ friendOne: data.one, friendTwo: data.two })
    .then((friendList) => {
      if (friendList.length) {
        callback(false);
      } else {
        friendModel
          .find({ friendOne: data.two, friendTwo: data.one })
          .then((friendList2) => {
            if (friendList2.length) {
              callback(false);
            } else {
              callback(true);
            }
          });
      }
    });
}

function saveNotif(condtion, callback) {
  inviteNotifModel.create(condtion).then((notif) => {
    callback(notif);
  });
}

function deleteNotif(notifId, callback) {
  inviteNotifModel.findByIdAndDelete(notifId).then(() => {
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

function getChannelName(channelId, callback) {
  channelModel.findById({ _id: channelId }).then((channel) => {
    callback(channel.channelName);
  });
}

module.exports = app;
