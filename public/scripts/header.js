const notifications = document.getElementById("notifications");
const socket = io();


// Socket recieves
socket.on("friend request", (data) => {
  let notif = document.createElement("div");
  notif.setAttribute("class", "notif flex-column")

  let notifHeader = document.createElement("div");
  notifHeader.innerHTML = data.type;

  let notifCont = document.createElement("div")
  notifCont.setAttribute("class", "notifCont flex");

  let frFrom = document.createElement("h5");
  frFrom.innerHTML = data.from;

  let accept = document.createElement("button");
  accept.setAttribute("class", "accept-btn");
  accept.innerHTML = `accept`;

  let reject = document.createElement("button");
  reject.setAttribute("class", "reject-btn");
  reject.innerHTML = `reject`;
  
  notifCont.appendChild(frFrom);
  notifCont.appendChild(reject);
  notifCont.appendChild(accept);
  
  notif.appendChild(notifHeader);
  notif.appendChild(notifCont);

  notifications.appendChild(notif);
});
