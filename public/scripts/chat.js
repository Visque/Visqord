const inputMessage = document.getElementById("message-input");
const messageSubmit = document.getElementById("message-submit");
const channelInfo = document.getElementById("channel-info");
const chatBoxMessages = document.getElementById("chat-box-messages");
const socket = io();

messageSubmit.onclick = (event) => {
  var message = inputMessage.value.trim();
  if(message === ""){
    return;
  }
  data = {
    message: message,
    channelId: channelInfo.getAttribute("key"),
  };

  socketData = {
    message: message,
    userName: channelInfo.getAttribute("username"),
    userId: channelInfo.getAttribute("userid"),
    channelId: channelInfo.getAttribute("key"),
  };

  var xhr = new XMLHttpRequest()
  xhr.open("post", "/post")
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(data))

  xhr.onload = () => {
      // Add the CSR post to the chat box OR socket.io program :)
      inputMessage.value = "";
      socket.emit("new message", socketData)
  }
}

socket.on("send message", (data) => {
  if (channelInfo.getAttribute("key") != data.channelId){
    return;
  }
  var messageCont = document.createElement("div");
  
  if (channelInfo.getAttribute("userid") == data.userId){
    messageCont.setAttribute("class", "message right");
  }
  else{
    messageCont.setAttribute("class", "message left");
  }

  var userName = document.createElement("div");
  userName.setAttribute("class", "user-name");
  userName.innerHTML = `${data.userName}`;

  var userMessage = document.createElement("div");
  userMessage.setAttribute("class", "user-message");
  userMessage.innerHTML = `${data.message}`;

  messageCont.appendChild(userName);
  messageCont.appendChild(userMessage);

  chatBoxMessages.appendChild(messageCont);
  chatBoxMessages.scrollTo(0, chatBoxMessages.scrollHeight);
})


// Create route post and save post to 