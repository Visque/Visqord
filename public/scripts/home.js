const showCreateChannelBtn = document.getElementById("show-create-channel");
const newChannelContainer = document.getElementById("new-channel-container");
const showJoinChannelBtn = document.getElementById("show-join-channel");
const joinChannelContainer = document.getElementById("join-channel-container");
const newChannelSubmit = document.getElementById("new-channel-submit");
const joinChannelSubmit = document.getElementById("join-channel-submit");
const joinChannelInput = document.getElementById("join-channel-link");
const inviteLinkList = document.querySelectorAll("#get-link");
// const channelItem = document.getElementById("channel-item");
console.log(inviteLinkList.length);

showCreateChannelBtn.onclick = (event) => {
    if(newChannelContainer.classList.contains("hide")){
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
    console.log("tags: ", tags)
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
    console.log(temp)
    var link = "/" + temp[3] + "/" + temp[4] + "/" + temp[5];

    var xhr = new XMLHttpRequest();
    xhr.open("get", (link));
    xhr.send();

    xhr.onload = () => {
      // Channel joined alert :)
      console.log("csr user added :) to channel :)")
      window.location.href = "/"
    };
}

// channelItem.onclick = (event) => {
// //   console.log(event);
//   var key = channelItem.getAttribute("key");

// //   window.location.href = `/channel/${key}`;
// };



for (let index = 0; index < inviteLinkList.length; index++) {
  let inviteLinkBtn = inviteLinkList[index];
  inviteLinkBtn.onclick = (event) => {
    var channelItem = inviteLinkBtn.parentElement;
    console.log(channelItem);
    var key = channelItem.getAttribute("key");
    var inviteLink = "http://localhost:3000/channel/invite/" + key;
    console.log('link: ', inviteLink.trim())
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

// inviteLink.onclick = (event) => {
//     console.log(event)
// }

