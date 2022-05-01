const express = require("express");
const session = require("express-session");


const app = express.Router();

// Database
const db = require("../database");
const userModel = require("../database/models/users");
const inviteNotifModel = require("../database/models/notifications");

// MiddleWares
// app.use(express.json());
// app.use(express.urlencoded());

app.route("/").post((req, res) => {
    let type = req.body.type;
    let to = req.body.to;
    let from = req.session.userId
    console.log("notif recieve check: ", req.body, from)

    findUser({userName: to}, function(userList){
        if(!userList.length){
            res.status(400)
            res.end();
        }
        else{
            res.status(200)
            let condition = {
              type: type,
              from: from,
              to: userList[0]._id,
            }
            saveNotif(condition, function(){
              res.end()
            })
        }
    })
});

// Functions

// Finds and returns a single user from the DB
function findUser(condition, callback) {
  userModel.find(condition).then((user) => {
    callback(user);
  });
}

function saveNotif(condtion, callback){
  inviteNotifModel.create(condtion).then(() => {
    callback();
  });
}

module.exports = app;
