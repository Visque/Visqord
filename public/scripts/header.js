const header = document.getElementById("header");

const userId = header.getAttribute("userid");
const userName = header.getAttribute("username");

const notifications = document.getElementById("notifications");
const socket = io();

// Socket emits
socket.emit("join user", {userName});

// Socket recieves
socket.on("friend request", (data) => {
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
  if (data.type == 1) {
    notifHeader.innerText = "Friend Request";
  } else if (data.type == 2) {
    notifHeader.innerText = "Channel Request";
  }

  let notifCont = document.createElement("div");
  notifCont.setAttribute("class", "notification-container flex");

  let frFrom = document.createElement("h5");
  frFrom.innerHTML = data.from;

  let accept = document.createElement("button");
  accept.setAttribute("class", "accept-btn btn");
  accept.innerHTML = `Accept`;
  accept.addEventListener("click",() => acceptFriend(notif, data.notifId));                         // adding listeners to new elements

  let reject = document.createElement("button");
  reject.setAttribute("class", "reject-btn btn");
  reject.innerHTML = `Reject`;
  reject.addEventListener("click",() => removeFriend(notif, data.notifId));                         // adding listeners to new elements

  notifCont.appendChild(frFrom);
  notifCont.appendChild(reject);
  notifCont.appendChild(accept);

  notif.appendChild(notifHeader);
  notif.appendChild(notifCont);

  notifications.appendChild(notif);
});

for (let index = 0; index < notifications.children.length; index++) {
  let currentNotif = notifications.children[index];
  let notifId = currentNotif.getAttribute("key");
  let type = currentNotif.children[0].innerHTML.trim();

  console.log(type);

  if (type == "Friend Request") {
    let userName = currentNotif.children[1].children[0];
    let rejectBtn = currentNotif.children[1].children[1];
    let acceptBtn = currentNotif.children[1].children[2];

    console.log(userName, rejectBtn);

    rejectBtn.onclick = () => removeFriend(currentNotif, notifId)

    acceptBtn.onclick = () => acceptFriend(currentNotif, notifId)

  } else {
    console.log("channel invite type :)");
  }
}


// Functions

function removeFriend(currentNotif, notifId){
  let xhr = new XMLHttpRequest();
  xhr.open("delete", `/notification/${notifId}`);
  xhr.send();

  xhr.onload = () => {
    currentNotif.remove();
  };
}

function acceptFriend(currentNotif, notifId){
  console.log("hello :)");
  let xhr = new XMLHttpRequest();
  xhr.open("post", `/friend`);
  xhr.setRequestHeader("Content-type", "application/json")

  let friendOne = currentNotif.getAttribute("to")
  let friendTwo = currentNotif.getAttribute("from")
  xhr.send(
    JSON.stringify({
      friend1: friendOne,
      friend2: friendTwo,
    })
  );

  xhr.onload = () => {
    console.log("yay freind added :)")
    removeFriend(currentNotif, notifId);
    window.location.href = "/";
  };
}