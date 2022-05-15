const inputFriendName = document.getElementById("add-friend-input");
const submitFriend = document.getElementById("send-fr");
const friends = document.getElementById("friends")

submitFriend.onclick = () => {
  let name = inputFriendName.value.trim();
  if (!name.length) {
    inputFriendName.value = "";
    return;
  }

  postData = {
    type: 1,
    to: name,
  };

  var xhr = new XMLHttpRequest();
  xhr.open("post", "/notification");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(postData));

  xhr.onload = () => {
    if (xhr.status === 200) {
      // Friend Request sent :)
      console.log("fr sent to ", name, xhr);
      let body = JSON.parse(xhr.response)
      // console.log(body)
      socket.emit("send notification", {
        notifId: body._id,
        type: 1,
        to: name,
        from: friends.getAttribute("userName"),
      }); 
    } else {
      // Failed to send FR
      console.log("fr failed to send to ", name);
    }
    // inputFriendName.value = ""
    // inputFriendName.focus();

  };
};

// Looping over friend items to send invites :)
for (let i = 0; i < friends.children.length; i++) {
  const sendChannelInvite = friends.children[i].children[1];
  let to = friends.children[i].children[0].innerHTML;
  to = to.trim()
  console.log('log check cr to: ', to)
  sendChannelInvite.onclick = () => showChannelsInviteList(to);
}

function showChannelsInviteList(to) {
  var getChannels = new XMLHttpRequest();
  getChannels.open("get", "/channel/channel/get");
  getChannels.send();

  getChannels.onload = () => {
    let channelList = getChannels.response.length
      ? JSON.parse(getChannels.response)
      : [];

    console.log(channelList);

    popChannelInviteToUser(channelList, to);
  };
}

function popChannelInviteToUser(channelList, sendTo) {
  // Creating popup
  let mainInviteContainer = document.createElement("div");
  mainInviteContainer.setAttribute(
    "class",
    "flex-column main fixed main-invite-container"
  );
  mainInviteContainer.setAttribute("id", "main-invite-container");
  let inviteContainer = document.createElement("div");
  inviteContainer.setAttribute(
    "class",
    "flex-column main fixed invite-container"
  );
  inviteContainer.setAttribute("id", "invite-container");
  mainInviteContainer.appendChild(inviteContainer);

  let header = document.createElement("div");
  header.innerHTML = `<h1>Invite To Channel</h1>`

  let searchBox = document.createElement("div");
  searchBox.setAttribute("class", "flex search-user");
  searchBox.setAttribute("id", "search-user");

  let inputSearch = document.createElement("input");
  inputSearch.setAttribute("placeholder", "Search User");

  let inputSubmit = document.createElement("btn");
  inputSubmit.setAttribute("class", "btn");
  inputSubmit.innerHTML = `Search`;

  // searchBox.appendChild(inputSearch);
  // searchBox.appendChild(inputSubmit);

  let inviteList = document.createElement("div");
  inviteList.setAttribute("class", "flex-column invite-list");
  inviteList.setAttribute("id", "invite-list");

  for (let index = 0; index < channelList.length; index++) {

    let channel = document.createElement("div");
    channel.setAttribute("class", "flex user-item");
    channel.setAttribute("id", "user-item");

    let channelName = document.createElement("div");
    channelName.setAttribute("class", "flex user-name");
    channelName.setAttribute("id", "user-name");
    channelName.innerHTML = `${channelList[index].channelName}`;

    let sendInvite = document.createElement("button");
    sendInvite.setAttribute("class", "flex send-invite btn");
    sendInvite.setAttribute("id", "send-invite btn");
    sendInvite.innerHTML = `Send Invite`;

    channel.appendChild(channelName);
    channel.appendChild(sendInvite);
    inviteList.appendChild(channel);

    // adding an event listener to the send Invite 
    sendInvite.onclick = (event) => {

      let postData = {
        type: 2,
        to: sendTo,
        channelId: channelList[index]._id,
      };

      console.log("CR postData to server: ", postData)

      var xhr = new XMLHttpRequest();
      xhr.open("post", "/notification");
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(JSON.stringify(postData));

      xhr.onload = () => {
        if (xhr.status === 200) {
          // Channel Request sent :)
          console.log("Cr sent to ", sendTo, xhr);
          let body = JSON.parse(xhr.response);
          console.log("channel notif: ", body);

          socket.emit("send notification", {
            notifId: body._id,
            type: 2,
            to: sendTo, //string
            from: friends.getAttribute("userName"), //string
            channelName: channelList[index].channelName,
            channelId: channelList[index]._id,
          });
        } else {
          // Failed to send CR
          console.log("Cr failed to send to ", sendTo);
        }
      };


    };

  }
  
  inviteContainer.appendChild(header);
  // inviteContainer.appendChild(searchBox);
  inviteContainer.appendChild(inviteList);

  main.appendChild(mainInviteContainer);
  mainInviteContainer.onclick = (event) =>
    removeChannelInviteToUser(event, mainInviteContainer);
}


function removeChannelInviteToUser(event, mainInviteContainer) {
  if (event.target.classList.contains("main-invite-container")) {
    container.style.opacity = "1";
    mainInviteContainer.remove();
  }
}
