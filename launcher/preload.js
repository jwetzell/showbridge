const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  updateConfig: (file) => {
    console.log(file);
    ipcRenderer.send('check_config', file);
  },
  loadConfig: () => {
    ipcRenderer.send('load_config');
  },
  quitApp: () => {
    ipcRenderer.send('quit');
  },
});
