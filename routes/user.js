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
const friendModel = require("../database/models/friends");

// MiddleWares
app.use(express.json());
app.use(express.urlencoded());


app.route("/").get((req, res) => {
  let friend = req.session.userId
    getUserFriends(friend , function (userList) {
      res.json(userList);
    });
})

// Functions: -
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

module.exports = app;
