const { ipcRenderer } = require('electron');

ipcRenderer.send('loaded');

function log(message) {
  document.getElementById('log').innerText += `router: ${message}\n`;
}

ipcRenderer.on('trigger', (event, trigger, triggerPath, fired) => {
  log(`${triggerPath} -> ${fired ? 'fired' : 'not-fired'}`);
});

ipcRenderer.on('action', (event, action, actionPath, fired) => {
  log(`${actionPath} -> ${fired ? 'fired' : 'not-fired'}`);
});

ipcRenderer.on('message', (event, message) => {
  log(`received ${JSON.stringify(message)}`);
});

ipcRenderer.on('message_out', (event, protocol, args) => {
  log(`sending ${protocol} -> ${JSON.stringify(args)}`);
});
