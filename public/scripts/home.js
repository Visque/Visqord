const container = document.getElementById("container")
const main = document.getElementById("main");
const showCreateChannelBtn = document.getElementById("show-create-channel");
const newChannelContainer = document.getElementById("new-channel-container");
const showJoinChannelBtn = document.getElementById("show-join-channel");
const joinChannelContainer = document.getElementById("join-channel-container");
const newChannelSubmit = document.getElementById("new-channel-submit");
const joinChannelSubmit = document.getElementById("join-channel-submit");
const joinChannelInput = document.getElementById("join-channel-link");
const inviteLinkList = document.querySelectorAll("#get-link");

// const channelItem = document.getElementById("channel-item");
// console.log(inviteLinkList.length);

showCreateChannelBtn.onclick = (event) => {
    if(newChannelContainer.classList.contains("hide")){
        showChannelInviteList("lmao")
        showJoinChannelBtn.classList.add("hide")

        newChannelContainer.classList.remove("hide")
        newChannelContainer.classList.add("flex-column");
        showCreateChannelBtn.innerHTML = `Cancel`
    }
    else{
        showJoinChannelBtn.classList.remove("hide")

        newChannelContainer.classList.add("hide");
        newChannelContainer.classList.remove("flex-column");
        showCreateChannelBtn.innerHTML = `Create Channel`;
    }
}

showJoinChannelBtn.onclick = (event) => {
    if (joinChannelContainer.classList.contains("hide")) {
        showCreateChannelBtn.classList.add("hide");

        joinChannelContainer.classList.remove("hide");
        joinChannelContainer.classList.add("flex-column");
        showJoinChannelBtn.innerHTML = `Cancel`;
    } else {
        showCreateChannelBtn.classList.remove("hide");

        joinChannelContainer.classList.add("hide");
        joinChannelContainer.classList.remove("flex-column");
        showJoinChannelBtn.innerHTML = `Join Channel`;
    }
}

newChannelSubmit.onclick = (event) => {
    var tags = newChannelContainer.children[2].value;
    tags = tags.split(" ");
    tags = tags.map(tag => {
        return ('#' + tag);
    });
    // console.log("tags: ", tags)
    var channelData = {
      channelName: newChannelContainer.children[0].value,
      description: newChannelContainer.children[1].value,
      tags: tags,
    };

    var xhr = new XMLHttpRequest();
    xhr.open("post", "/channel")
    xhr.setRequestHeader("Content-type", "application/json")
    xhr.send(JSON.stringify(channelData))

    xhr.onload = () => {
        // Channel joined alert :)
        window.location.href = "/"
    }
}

joinChannelSubmit.onclick = (event) => {

    var invLink = joinChannelInput.value.trim();

    var temp = invLink.split("/")
    var link = "/" + temp[3] + "/" + temp[4] + "/" + temp[5];
    // console.log(link)

    var xhr = new XMLHttpRequest();
    xhr.open("get", (link));
    xhr.send();

    xhr.onload = () => {
      // Channel joined alert :)
      //   console.log("csr user added :) to channel :)")

      window.location.href = "/"
    };
}

function showChannelInviteList(channelId){
    var getUsers = new XMLHttpRequest()
    getUsers.open("get", "/user")
    getUsers.send();

    getUsers.onload = () => {

        let userList = getUsers.response.length ? JSON.parse(getUsers.response) : []

        // Creating popup
        let mainInviteContainer = document.createElement("div")
        mainInviteContainer.setAttribute("class", "flex-column main fixed main-invite-container")
        mainInviteContainer.setAttribute("id", "main-invite-container");

        let inviteContainer = document.createElement("div")
        inviteContainer.setAttribute("class", "flex-column main fixed invite-container")
        inviteContainer.setAttribute("id", "invite-container");

        mainInviteContainer.appendChild(inviteContainer);   
        
        let searchBox = document.createElement("div");
        searchBox.setAttribute("class", "flex search-user");
        searchBox.setAttribute("id", "search-user");

        let inputSearch = document.createElement("input")
        inputSearch.setAttribute("placeholder", "Search User");
        let inputSubmit = document.createElement("btn");
        inputSubmit.setAttribute("class", "btn")

        inputSubmit.innerHTML = `Search`

        searchBox.appendChild(inputSearch);
        searchBox.appendChild(inputSubmit);
    
        let inviteList = document.createElement("div");
        inviteList.setAttribute("class", "flex-column invite-list");
        inviteList.setAttribute("id", "invite-list");
        for (let index = 0; index < userList.length; index++) {
            let user = document.createElement("div");
            user.setAttribute("class", "flex user-item");
            user.setAttribute("id", "user-item");

            let userName = document.createElement("div");
            userName.setAttribute("class", "flex user-name");
            userName.setAttribute("id", "user-name");

            userName.innerHTML = `${userList[index].userName}`;

            let sendInvite = document.createElement("button");
            sendInvite.setAttribute("class", "flex send-invite btn");
            sendInvite.setAttribute("id", "send-invite btn");

            sendInvite.innerHTML = `Send Invite`
            
            user.appendChild(userName);
            user.appendChild(sendInvite);

            inviteList.appendChild(user);
            
            console.log("clicking on btn :)")
            sendInvite.addEventListener("click", (event) => {
              // Send channel invite to the user
              console.log("clicking :)");
              // sendChannelInvite(userName, channelId)
            })
            // sendInvite.onclick = (event) => {
            //   // Send channel invite to the user
            //   console.log("clicking :)");
            //   // sendChannelInvite(userName, channelId)
            // };
        }
    
        inviteContainer.appendChild(searchBox);
        inviteContainer.appendChild(inviteList);
    

        main.appendChild(mainInviteContainer)
        mainInviteContainer.onclick = (event) => removeInviteChannelList(event, mainInviteContainer)
        
    }


}

function removeInviteChannelList(event, mainInviteContainer){
    if(event.target.classList.contains("main-invite-container")){
        container.style.opacity = "1";
        mainInviteContainer.remove();
    }
}

for (let index = 0; index < inviteLinkList.length; index++) {
  let inviteLinkBtn = inviteLinkList[index];
  inviteLinkBtn.onclick = (event) => {
    var channelItem = inviteLinkBtn.parentElement;
    // console.log(channelItem);
    var key = channelItem.getAttribute("key");
    var inviteLink = "http://localhost:3000/channel/invite/" + key;
    // console.log('link: ', inviteLink.trim())

    navigator.clipboard.writeText(inviteLink);
    // invite link copied to clipboard :)
    
    var notifier = document.createElement("div")
    notifier.setAttribute("class", "notifier flex")
    
    notifierMessage = document.createElement("h5")
    notifierMessage.setAttribute("class", "notifier-message")
    notifierMessage.innerHTML = `invite link copied to Clipboard !`
    inviteLinkBtn.appendChild(notifier);
    
    notifier.appendChild(notifierMessage)
    setTimeout(() => {
        notifier.remove();
    }, 1000)
  };
}

function sendChannelInvite(userName, channelId){

    let postData = {
      type: 2,
      to: userName,
      channelId: channelId,
    }

    var xhr = new XMLHttpRequest();
    xhr.open("post", "/notification");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(postData));

    xhr.onload = () => {
    if (xhr.status === 200) {
      // Channel Request sent :)
      console.log("fr sent to ", userName, xhr);
      let body = JSON.parse(xhr.response)
      console.log('channel notif: ', body)
      socket.emit("send notification", {
        notifId: body._id,
        type: 2,
        to: userName,
        from: friends.getAttribute("userName"),
        channelName: channelName,
      });
    } else {
      // Failed to send CR
      console.log("Cr failed to send to ", userName);
    }

    }
}

// inviteLink.onclick = (event) => {
//     console.log(event)
// }

