/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const dragContainer = document.getElementById('drag-drop-container');
const messageIndicator = document.getElementById('message-indicator');

dragContainer.onclick = () => {
  window.electron.send('load_config_from_file_browser');
};

dragContainer.ondrop = (event) => {
  event.preventDefault();
  if (event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    window.electron.send('load_config_from_file', { name: file.name, path: file.path });
  }
};

dragContainer.ondragover = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

electron.on('message', (event, message) => {
  // NOTE(jwetzell) flash message indicator
  messageIndicator.style.display = 'block';
  setTimeout(() => {
    messageIndicator.style.display = 'none';
  }, 100);
});

function showLogs() {
  electron.send('show_logs');
}

function showWebUI() {
  electron.send('show_ui');
}

function quitApp() {
  electron.send('quit');
}

function showSettings() {
  electron.send('show_settings');
}
