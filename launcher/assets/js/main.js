const dragContainer = document.getElementById('drag-drop-container');
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
