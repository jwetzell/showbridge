const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Router = require('../../lib/router');
const Config = require('../../lib/config');

const defaultConfig = require('../../config/default.json');

const config = new Config(defaultConfig);
const router = new Router(config);
router.start();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.setBackgroundColor('#282a36');
  win.loadFile('index.html');

  router.on('trigger', (trigger, triggerPath, fired) => {
    win.webContents.send('trigger', trigger, triggerPath, fired);
  });

  router.on('action', (action, actionPath, fired) => {
    win.webContents.send('action', action, actionPath, fired);
  });

  router.on('message', (message) => {
    win.webContents.send('message', message);
  });

  router.on('message_out', (protocol, args) => {
    win.webContents.send('message_out', protocol, args);
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
