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

// MiddleWares
app.use(express.json());
app.use(express.urlencoded());


app.route("/").get((req, res) => {
    findUser({}, function(userList){
        res.json(userList)
    })
})

// Functions: -
function findUser(condition, callback) {
  userModel.find(condition).then((user) => {
    callback(user);
  });
}

module.exports = app;
