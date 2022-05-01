const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express.Router();

// Database
const channelModel = require("../database/models/channels");
const userModel = require("../database/models/users");
const postModel = require("../database/models/posts");
const userChannelModel = require("../database/models/userChannels");
const crypto = require("../encryption/encryption");

// MiddleWares
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded());

app
  .route("/")
  .get((req, res) => {
    let startLimit = Number(req.query.startLimit);
    let channelId = req.query.channelId;
    // console.log('queries : ', typeof startLimit)
    getNextTenPost(channelId, startLimit, function(posts){
      res.end(JSON.stringify(posts))
    })
  })                            // Lazy loading
  .post((req, res) => {
    var userId = req.session.userId;
    var postData = req.body;
    postData.createdBy = userId;
    // console.log('log post data: ', postData);

    savePost(postData, function (cartId) {
      // console.log("Post Saved succesfully");
      res.end()
    });
  });


// Functions
function savePost(postData, callback){
    postModel.create(postData).then(() => {
        callback();
    });
}

function getNextTenPost(channelId, startLimit, callback){
  // console.log('lettuce: ', channelId, startLimit)
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
        $skip: startLimit
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
    .then((posts) => {
      posts.forEach((post) => {
        post.createdBy = post.createdBy[0];
      });
      // console.log("lazy: ", posts);
      callback(posts);
    });
}

module.exports = app;
