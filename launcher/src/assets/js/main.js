/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const dragContainer = document.getElementById('drag-drop-container');
const messageIndicator = document.getElementById('message-indicator');

dragContainer.onclick = () => {
  window.electron.send('loadConfigFromFileBrowser');
};

dragContainer.ondrop = (event) => {
  event.preventDefault();
  if (event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    window.electron.send('loadConfigFromFile', { name: file.name, path: file.path });
  }
};

dragContainer.ondragover = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

electron.on('messageIn', (event, message) => {
  console.log(message);
  // NOTE(jwetzell) flash message indicator
  messageIndicator.style.display = 'block';
  setTimeout(() => {
    messageIndicator.style.display = 'none';
  }, 100);
});

function showLogs() {
  electron.send('showLogs');
}

function showWebUI() {
  electron.send('showUI');
}

function quitApp() {
  electron.send('quit');
}

function showSettings() {
  electron.send('showSettings');
}
