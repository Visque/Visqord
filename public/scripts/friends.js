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
      console.log(body)
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
    inputFriendName.value = ""
    inputFriendName.focus();

  };
};
