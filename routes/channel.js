const express = require("express");
const session = require("express-session");

const app = express.Router();

// Database
const channelModel = require("../database/models/channels");
const postModel = require("../database/models/posts");
const userModel = require("../database/models/users");
const crypto = require("../encryption/encryption");

// MiddleWares
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded());

app.route("/")
.get((req, res) => {
  res.render("auth/signin.ejs", {error: ""})
})
.post((req, res) => {
    var userId = req.session.userId;
    var channelData = req.body;
    channelData.createdBy = userId;
    channelData.members = [userId];
    // console.log(channelData)

    saveChannel(channelData, function(cartId){
      console.log("channel Saved succesfully")
      addChannelToUser(userId, cartId, function () {
        console.log("channel added to usersChannel");
      });
    })
});

app.route("/:channelId").get((req, res) => {
  var channelId = req.params.channelId        // decrypt
  var userId = req.session.userId;
  var userName = req.session.userName;

  console.log('decrypted channel id: ', channelId)
  var context = {}
  getUserChannels(userId, function(channels){

    var postSearchCondition = {
      channelId: channelId,
    };
    getUserPosts(postSearchCondition, function (posts) {

      posts.sort((a, b) => a.createdAt < b.createdAt);

      context.channels = channels;
      context.user = {userId: userId, userName: userName};
      context.posts = posts;

      console.log(context)

      context.selector = channels.filter((channel) => {
        return channel._id == channelId;
      })[0];

      // console.log("channels/ context: ", context);
      res.render("home.ejs", context);
    });

  })

})

app.route("/invite/:channelId").get((req, res) => {
    var userId = req.session.userId;
    var channelId = req.params.channelId;     // Decrypt

    getUserChannels(userId, function(channels){
      check = channels.filter(channel => {
        return channel._id == channelId
      })

      if(check.length){
        res.status(400)
        res.end("/");
        return;
      }
      else{
        addChannelToUser(userId, channelId, function(){
          console.log("added user to channel :)")
          res.end("/")
        })
      }
    })
    

})

// Functions

function saveChannel(newChannel, callback){
  channelModel.create(newChannel).then((channel) => {
    console.log("logging channel: ", channel)
    callback(channel._id)
  })
}

function addChannelToUser(userId, channelId, callback){
  userModel.findById(userId).then((user) => {
    let userChannelList = [...user.channels, channelId]
    console.log("testing spread op: ", userChannelList);
    userModel.findByIdAndUpdate(userId, { channels: userChannelList }).then(() => {
      callback()
    });
  });
}

function getUserChannels(userId, callback) {
  {
    userModel
      .findById(userId)
      .populate("channels")
      .then((user) => {
        callback(user.channels);
      });
  }
}

function getUserPosts(condition, callback) {
  postModel
    .find(condition)
    .populate("createdBy")
    .then((postList) => {
      callback(postList);
    });
}

function findUser(condition, callback) {
  userModel.findOne(condition).then((user) => {
    callback(user);
  });
}

// function getUserChannels(userId, callback) {
//   {
//     userModel.find({ _id: userId }).populate("channels").then((channelList) => {
//       callback(channelList);
//     });
//   }
// }

module.exports = app;
