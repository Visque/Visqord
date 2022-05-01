const express = require("express");
const session = require("express-session");

const app = express.Router();

// Database
const db = require("../database");
const userModel = require("../database/models/users");

db.start();

// Set All users status as offline


async function firstAsync() {
  let promise = new Promise((res, rej) => {
      userModel.updateMany({ status: 0 }).then(() => {
        console.log("all user status set to 0 :)");
      });
  });

  // wait until the promise returns us a value
  let result = await promise; 

  // "Now it's done!"
}

firstAsync();

// MiddleWares
// app.use(express.json());
// app.use(express.urlencoded());

app.route("/").get((req, res) => {
  res.redirect("/auth/signin");
});

app
  .route("/signin")
  .get((req, res) => {
    let context = { error: "" };
    res.render("auth/signin.ejs", context);
  })
  .post((req, res) => {
    var userName = req.body.userName;
    var password = req.body.password;

    findUser({ userName: userName }, function (userObj) {
      if (userObj && password == userObj.password) {
        setUserStatus(userObj._id, 1, function () {
          req.session.isLoggedIn = true;
          req.session.userName = userObj.userName;
          req.session.userId = userObj._id;
          res.redirect("/");
        });
      } else {
        res.render("auth/signin", { error: "Wrong Credentials" });
      }
    });
  });

app
  .route("/signup")
  .get((req, res) => {
    let context = { error: "" };
    res.render("auth/signup.ejs", context);
  })
  .post((req, res) => {
    // console.log("log req body: ", req.body);
    var userName = req.body.userName;
    var email = req.body.email;
    var region = req.body.region;
    var password = req.body.password;
    var passwordCheck = req.body.confirmPassword;

    if (password !== passwordCheck) {
      res.render("/auth/signup", { error: "Passwords Don't Match" });
      return;
    }

    var userData = {
      userName: userName,
      email: email,
      password: password,
      region: region,
    };

    // console.log("log check userData: ", userData);

    saveUser(userData, function () {
      res.redirect("/auth/signin");
    });
  });

// Functions

// saves a user to the DB
function saveUser(userData, callback) {
  userModel.create(userData).then(() => {
    callback();
  });
}
// Finds and returns a single user from the DB
function findUser(condition, callback) {
  userModel.findOne(condition).then((user) => {
    callback(user);
  });
}

function setUserStatus(userId, status, callback){
  userModel.updateOne({_id: userId}, {status: status}).then(() => {
    callback();
  })
}
module.exports = app;
