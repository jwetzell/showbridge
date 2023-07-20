// NOTE(jwetzell): HEAVY inspiration from https://github.com/bitfocus/companion/launcher

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const respawn = require('respawn');
const defaultConfig = require('../../config/default.json');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 200,
    height: 50,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  const configDir = path.join(app.getPath('appData'), '/showbridge/');
  console.log(`config dir exists: ${fs.existsSync(configDir)}`);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  const configFilePath = path.join(configDir, 'config.json');
  console.log(`config file exists: ${fs.existsSync(configFilePath)}`);
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig));
  }

  try {
    let rootPath = process.resourcesPath;
    if (!app.isPackaged) {
      rootPath = path.join(__dirname, '..');
    }

    // NOTE(jwetzell): evaluate how node binary will need to be determined when it comes to a packaged app

    const showbridgeProcess = respawn(() => ['node', path.join(rootPath, 'cli/main.js'), '-c', configFilePath, `-t`], {
      name: 'showbridge process',
      env: {
        IPC_PARENT: 1,
      },
      maxRestarts: -1,
      sleep: 1000,
      kill: 5000,
      cwd: rootPath,
      stdio: [null, null, null, 'ipc'],
    });

    showbridgeProcess.on('start', () => {
      console.log('process start');
    });

    showbridgeProcess.on('stop', () => {
      console.log('process stop');
    });

    showbridgeProcess.on('spawn', () => {
      console.log('process spawn');
    });

    showbridgeProcess.on('exit', (code) => {
      console.log(`process exit ${code}`);
    });

    showbridgeProcess.on('stdout', (data) => {
      console.log(`stdout ${data}`);
    });
    showbridgeProcess.on('stderr', (data) => {
      console.log(`stderr ${data}`);
    });

    showbridgeProcess.start();
  } catch (error) {
    console.error(`problem loading existing config`);
    console.error(error);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
