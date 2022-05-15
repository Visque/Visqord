const header = document.getElementById("header");

const userId = header.getAttribute("userid");
const userName = header.getAttribute("username");

const notifications = document.getElementById("notifications");
const socket = io();

// Socket emits to join user room
socket.emit("join user", { userName });

// Socket recieves
socket.on("notif request", (data) => {
  if (notifications.children[0].classList.contains("empty")) {
    // Removing `no notifications` div
    notifications.children[0].remove();
  }

  let notif = document.createElement("div");
  notif.setAttribute("class", "notif flex-column");
  notif.setAttribute("to", data.to);
  notif.setAttribute("from", data.from);

  let notifHeader = document.createElement("div");
  notifHeader.setAttribute("class", "type");

  let notifCont = document.createElement("div");
  notifCont.setAttribute("class", "notification-container flex");

  let frFrom = document.createElement("h5");
  frFrom.innerHTML = data.from;

  let accept = document.createElement("button");
  accept.setAttribute("class", "accept-btn btn");
  accept.innerHTML = `Accept`;

  let reject = document.createElement("button");
  reject.setAttribute("class", "reject-btn btn");
  reject.innerHTML = `Reject`;

  if (data.type == 1) {
    notifHeader.innerText = "Friend Request";
    accept.addEventListener("click", () => acceptFriend(notif, data.notifId));
    reject.addEventListener("click", () => removeFriend(notif, data.notifId));
  } else if (data.type == 2) {
    notifHeader.innerText = "Channel Request";
    notif.setAttribute("channelName", data.channelName);
    notif.setAttribute("channelId", data.channelId);

    let invitedChannelName = document.createElement("h5");
    invitedChannelName.innerHTML = data.channelName;

    accept.addEventListener("click", () => acceptChannel(notif, data.notifId));
    reject.addEventListener("click", () => removeChannel(notif, data.notifId));

    notifCont.appendChild(invitedChannelName);
  }

  notifCont.appendChild(frFrom);
  notifCont.appendChild(reject);
  notifCont.appendChild(accept);

  notif.appendChild(notifHeader);
  notif.appendChild(notifCont);

  notifications.appendChild(notif);
});


// Adding listeners to loaded notifs

for (let index = 0; index < notifications.children.length; index++) {
  let currentNotif = notifications.children[index];
  let notifId = currentNotif.getAttribute("key");
  let type = currentNotif.children[0].innerHTML.trim();

  console.log(type);

  if (type == "Friend Request") {
    let rejectBtn = currentNotif.children[1].children[1];
    let acceptBtn = currentNotif.children[1].children[2];


    rejectBtn.onclick = () => removeFriend(currentNotif, notifId);
    acceptBtn.onclick = () => acceptFriend(currentNotif, notifId);
  } else if (type == "Channel Request") {
    let rejectBtn = currentNotif.children[1].children[2];
    let acceptBtn = currentNotif.children[1].children[3];


    rejectBtn.onclick = () => removeChannel(currentNotif, notifId);
    acceptBtn.onclick = () => acceptChannel(currentNotif, notifId);
  }
}

// Functions

function removeChannel(currentNotif, notifId) {
  let xhr = new XMLHttpRequest();
  xhr.open("delete", `/notification/${notifId}`);
  xhr.send();

  xhr.onload = () => {
    currentNotif.remove();
  };
}

function removeFriend(currentNotif, notifId) {
  let xhr = new XMLHttpRequest();
  xhr.open("delete", `/notification/${notifId}`);
  xhr.send();

  xhr.onload = () => {
    currentNotif.remove();
  };
}

function acceptFriend(currentNotif, notifId) {
  console.log("hello :)");
  let xhr = new XMLHttpRequest();
  xhr.open("post", `/friend`);
  xhr.setRequestHeader("Content-type", "application/json");

  let friendOne = currentNotif.getAttribute("to");
  let friendTwo = currentNotif.getAttribute("from");
  xhr.send(
    JSON.stringify({
      friend1: friendOne,
      friend2: friendTwo,
    })
  );

  xhr.onload = () => {
    console.log("yay freind added :)");
    removeFriend(currentNotif, notifId);
    window.location.href = "/";
  };
}

function acceptChannel(currentNotif, notifId) {
  let channelId = currentNotif.getAttribute("channelid");
  console.log("log check channelID :) :) :) :) :::", channelId);

  let xhr = new XMLHttpRequest();
  xhr.open("get", `/channel/invite/${channelId}`);
  xhr.setRequestHeader("Content-type", "application/json");

  xhr.send();

  xhr.onload = () => {
    console.log("yay Channel added :)");
    removeChannel(currentNotif, notifId);
    window.location.href = "/";
  };
}
