const express = require("express");
const session = require("express-session");
const crypto = require("./encryption/encryption");

const app = express();

const http = require("http");
const server = http.createServer(app);

// Router Imports
const auth = require("./routes/auth");
const home = require("./routes/home");
const channel = require("./routes/channel");
const post = require("./routes/post");
const req = require("express/lib/request");

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
app.use("/post", post);


// Socket
const io = require("socket.io")(server);

// const { Server } = require("socket.io");
// const io = new Server(server);

io.on("connection", (socket) => {
  console.log("socket connection established");
  // socket.on("disconnect", () => {
  //   io.emit("send message", {
  //     message: `${socket.username} has left the chat`,
  //     user: "Welcome Bot",
  //   });
  // });

  socket.on("new message", (data) => {
    console.log('send to all: ', data, data.userId);
    io.emit("send message", { message: data.message, userName: data.userName, userId: data.userId });
  });

  socket.on("new user", (usr) => {
    socket.username = usr;
    io.emit("send message", {
      message: `${socket.username} has joined the chat`,
      user: "Welcome Bot",
    });
  });

});




// ServerListener
server.listen(3000, () => {
  console.log(`Server is Live and running :)`);
});



// Create channel.ejs.
// Pass channels data under for loop
// Add a get req to /channel/encrypted(channelID)