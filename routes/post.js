const express = require("express");
const session = require("express-session");

const app = express.Router();

// Database
const channelModel = require("../database/models/channels");
const postModel = require("../database/models/posts");
const crypto = require("../encryption/encryption");

// MiddleWares
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded());

app
  .route("/")
  .post((req, res) => {
    var userId = req.session.userId;
    var postData = req.body;
    postData.createdBy = userId;
    console.log('log post data: ', postData);

    savePost(postData, function (cartId) {
      console.log("Post Saved succesfully");
      res.end()
    });
  });

// Functions
function savePost(postData, callback){
    postModel.create(postData).then(() => {
        callback();
    });
}

module.exports = app;
