const express = require("express");
const session = require("express-session");
// const crypto = require("../encryption/encryption");

const app = express.Router();

// Database
const userModel = require("../database/models/users");
const channelModel = require("../database/models/channels");
const postModel = require("../database/models/posts");

// MiddleWares
app.use(express.json());
app.use(express.urlencoded());

app.route("/").get((req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/auth");
    return;
  }
  var userId = req.session.userId;
  var userName = req.session.userName;
  findUser({ _id: userId }, function (user) {
      if(user.status !== 0){

        // User is Authenticated :)
        var context = {}
        getUserChannels(userId, function(channels){
          // channels = channels.map(channel => ({
          //   ...channel,
          //   _id: crypto.encrypt(JSON.stringify(channel._id)),
          // }))
          // for (var i = 0; i < channels.length; ++i) {
          //   console.log('b4: ', channels[i]._id);
          //   channels[i]._id = crypto.encrypt(JSON.stringify(channels[i]._id));
          //   console.log('a4: ', crypto.encrypt(JSON.stringify(channels[i]._id)));
          // }
          var postSearchCondition = {
            createdBy: userId,
          };
          getUserPosts(postSearchCondition, function (posts) {
            context.user = {userId: userId, userName: userName};
            context.channels = channels;
            context.posts = posts;
            context.selector = "dashboard";

            // console.log("log check home user channels: ", channels);
            // console.log("log check home user posts: ", posts);
            res.render("home.ejs", context);
          });
        })

      }
      else{
          res.redirect("/auth")
      }
  });
});

app.route("/logout").get((req, res) => {
  req.session.destroy();
  res.redirect("/auth")
})
// Functions

function findUser(condition, callback) {
  userModel.findOne(condition).then((user) => {
    callback(user);
  });
}

function getUserChannels(userId, callback){{
    userModel.findById(userId).populate("channels").then(user => {
      callback(user.channels)
    })
}}

function getUserPosts(condition, callback){
  postModel
    .find(condition)
    .populate("createdBy")
    .then((postList) => {
      callback(postList);
    });
}

module.exports = app;
