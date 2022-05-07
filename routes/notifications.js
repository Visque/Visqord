const express = require("express");
const session = require("express-session");

const app = express.Router();

// Database
const db = require("../database");
const userModel = require("../database/models/users");
const inviteNotifModel = require("../database/models/notifications");
const friendModel = require("../database/models/friends");

// MiddleWares
// app.use(express.json());
// app.use(express.urlencoded());

app
  .route("/")
  .post((req, res) => {
    let type = Number(req.body.type);
    let to = req.body.to;
    let from = req.session.userId;
    console.log("notif recieve check: ", req.body, from);

    findUser({ userName: to }, function (userObj) {
      console.log(userObj);
      if (!userObj || userObj._id == from) {
        res.status(400);
        res.end();
        return;
      }
      findFriend({one: userObj._id, two: from}, function(check){
        if(check == true){
          findNotif(
            { to: userObj._id, from: from, type: type },
            function (notifList) {
              console.log('notifList haha: ', notifList)
              if (!notifList.length) {
                res.status(200);
                let condition = {
                  type: type,
                  from: from,
                  to: userObj._id._id,
                };
                saveNotif(condition, function (notif) {
                  res.end(JSON.stringify(notif));
                });
              } else {
                res.status(400).end();
              }
            }
          );
        }
        else{
          res.status(400).end()
        }
      })

    });
  })
  
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

function findFriend(data, callback){
  friendModel.find({friendOne: data.one, friendTwo: data.two}).then(friendList => {
    if(friendList.length){
      callback(false)
    }
    else{
      friendModel.find({ friendOne: data.two, friendTwo: data.one }).then((friendList2) => {
          if (friendList2.length) {
            callback(false);
          } else {
            callback(true);
          }
        });
    }
  })
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

module.exports = app;
