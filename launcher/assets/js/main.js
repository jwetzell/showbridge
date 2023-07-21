const dragContainer = document.getElementById('drag-container');
dragContainer.onclick = (event) => {
  window.electron.loadConfig();
};

dragContainer.ondrop = (event) => {
  event.preventDefault();
  if (event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    window.electron.updateConfig({ name: file.name, path: file.path });
  }
};

dragContainer.ondragover = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

document.getElementById('quit-button').onclick = (event) => {
  window.electron.quitApp();
};
