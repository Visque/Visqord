const express = require("express");
const session = require("express-session");
const crypto = require("./encryption/encryption");

const app = express();
const PORT = process.env.PORT || 5000

const http = require("http"); 
const server = http.createServer(app);

// Socket
const io = require("socket.io")(server);
var a = 10
// console.log("logging sock: ", io)
module.exports = io;

// Router Imports
const auth = require("./routes/auth");
const home = require("./routes/home");
const channel = require("./routes/channel");
const post = require("./routes/post");
const user = require("./routes/user");
const notification = require("./routes/notifications");
const friends = require("./routes/friends");

// MiddleWares

app.use(express.json())
app.use(express.urlencoded());

app.use(express.static("public"));

app.set("view engine", "ejs")
app.set("views", "views")

app.use(
  session({
    secret: "keyboard Cat",
  })
);

// Routes
app.use("/", home)
app.use("/auth", auth);
app.use("/channel", channel);
app.use("/user", user);
app.use("/post", post);
app.use("/notification", notification);
app.use("/friend", friends);

app.route("*").get((req, res ) => {
  res.render("error/500.ejs")
})



// const { Server } = require("socket.io");
// const io = new Server(server);

// io.on("connection", (socket) => {
//   console.log("socket connection established");
  
//   // socket.on("send notification", (data) => {
//   //   console.log(`sending notif to ${data}`, typeof data.type)
//   //   if(data.type == 1){
//   //     // socket.join(data.to);
//   //     io.emit("friend request", { to: data.to, from: data.from })
//   //   }
//   // })
  
//   socket.on("new message", (data) => {
//     socket.join(data.channelId);
//     console.log('send to channel: ', data);
//     io.to(data.channelId).emit("send message", { message: data.message, userName: data.userName, userId: data.userId, channelId: data.channelId });
//   });

//   socket.on("new user", (usr) => {
//     socket.username = usr;
//     io.emit("send message", {
//       message: `${socket.username} has joined the chat`,
//       user: "Welcome Bot",
//     });
//   });

// });




// ServerListener
server.listen(PORT, () => {
  console.log(`Server is Live and running :)`);
});

// ToDo

// Get user notif and pass to home.ejs from home.js and channel.js Routes :)
// populate notifs via forloop in headers.ejs
// add listeners to accept and reject button in notification
// add friends via accept and reject
// send channel invite notif via socket.io
// add user to channel via channel invite
// send invite to user via create channel invitation popup
// Add user to user DM 

// :)