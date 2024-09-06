const loadingAnimation = document.getElementById('loadingAnimation');
const messageInput = document.getElementById('messageInput');

// Socket.io
const socket = io();

socket.on('connect', () => {
  document.getElementById("messageInput").removeAttribute('disabled');
  document.getElementById("messageInput").placeholder = "Type your message..."
  document.getElementById("send-button").style.display = "block";
  document.getElementById("sysText").remove();
});

socket.on('disconnect', () => {
  document.getElementById("messageInput").value = "";
  document.getElementById("messageInput").disabled = true;
  document.getElementById("messageInput").placeholder = "You are disconnected..."
  document.getElementById("send-button").style.display = "none";
  const sysText = document.createElement('p');
  sysText.textContent = "You have been disconnected.";
  sysText.id = "sysText";
  sysText.setAttribute("class", "sysText");
  document.querySelector(".messages").appendChild(sysText);
});

socket.on('messageUpdate', (data) => {
  if (data.error) {
    alert(data.error);

    // Turn off loading animation
    loadingAnimation.style.display = 'none';
    messageInput.style.width = 'calc(100% - 30px)';

    return;
  }
  
  if (data.origin == "own") {
    document.querySelector(".messages").innerHTML += `
    <div class="messageSent">
      <p>${data.message}</p>
    </div>
    `
    
    messageInput.value = "";
    // Turn off loading animation
    loadingAnimation.style.display = 'none';
    messageInput.style.width = 'calc(100% - 30px)';
  } else {
    document.querySelector(".messages").innerHTML += `
    <div class="messageReceived">
      <p>${data.message}</p>
    </div>
    `
  }
});

function sendMessage() {
  // Show loading animation
  loadingAnimation.style.display = 'block';
  messageInput.style.width = 'calc(100% - 90px)';

  const message = messageInput.value.trim();

  if (message) {
    socket.emit('messageSent', message);
  } else {
    // Turn off loading animation
    loadingAnimation.style.display = 'none';
    messageInput.style.width = 'calc(100% - 30px)';
  }
}
