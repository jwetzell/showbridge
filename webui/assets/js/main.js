const socket = new WebSocket(`ws://${location.host}/`, 'webui');

socket.onopen = (event) => {
  socket.send("Here's some text that the server is urgently awaiting!");
};

socket.onmessage = (eventObj) => {
  const event = JSON.parse(eventObj.data);
  if (event.eventType === 'message') {
    const messageIndicator = document.getElementById(`${event.data.message.messageType}-message-indicator`);
    // NOTE(jwetzell) flash message indicator
    messageIndicator.style.visibility = 'visible';
    setTimeout(() => {
      messageIndicator.style.visibility = 'hidden';
    }, 100);
  }
};
