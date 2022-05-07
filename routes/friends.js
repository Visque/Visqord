const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express.Router();

// Database
const userChannelModel = require("../database/models/userChannels");
const channelModel = require("../database/models/channels");
const postModel = require("../database/models/posts");
const userModel = require("../database/models/users");
const inviteNotifModel = require("../database/models/notifications");
const friendModel = require("../database/models/friends");
const crypto = require("../encryption/encryption");

// MiddleWares
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded());

// Routing

app.route("/").post((req, res) => {
  var friend1 = req.body.friend1
  var friend2 = req.body.friend2;
  console.log('freind: ', req.body)
  findUser({userName: friend1}, function(friend1Id){
      findUser({userName: friend2}, function(friend2Id){
          addFriend(
            {
              friendOne: friend1Id,
              friendTwo: friend2Id,
              invitedBy: friend2Id,
            },
            function () {
              res.status(200).end();
            }
          );
      })
  })
});

// Functions

function addFriend(data, callback){
    friendModel.create(data).then(() => {
        callback()
    })
}

function findUser(condition, callback) {
  userModel.findOne(condition).then((user) => {
    callback(user._id);
  });
}

module.exports = app;
