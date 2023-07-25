const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: ipcRenderer.send,
  on: (eventName, callback) => {
    ipcRenderer.on(eventName, (event, ...args) => {
      callback(event, ...args);
    });
  },
});
