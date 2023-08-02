const dragContainer = document.getElementById('drag-drop-container');
const messageIndicator = document.getElementById('message-indicator');

dragContainer.onclick = (event) => {
  window.electron.send('load_config');
};

dragContainer.ondrop = (event) => {
  event.preventDefault();
  if (event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    window.electron.send('check_config', { name: file.name, path: file.path });
  }
};

dragContainer.ondragover = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

document.getElementById('quit-button').onclick = (event) => {
  electron.send('quit');
};

document.getElementById('show-logs').onclick = (event) => {
  electron.send('show_logs');
};

document.getElementById('show-ui').onclick = (event) => {
  electron.send('show_ui');
};

electron.on('message', (event, message) => {
  // NOTE(jwetzell) flash message indicator
  messageIndicator.style.display = 'block';
  setTimeout(() => {
    messageIndicator.style.display = 'none';
  }, 100);
});
