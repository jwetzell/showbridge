// NOTE(jwetzell): HEAVY inspiration from https://github.com/bitfocus/companion/launcher

const electron = require('electron');
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');

const path = require('path');
const fs = require('fs-extra');
const respawn = require('respawn');
const defaultConfig = require('../config/default.json');

let restartProcess = true;

let showbridgeProcess;
let win;
let tray;
let configDir;

function toggleWindow() {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}

function quitApp() {
  electron.dialog
    .showMessageBox(undefined, {
      title: 'showbridge',
      message: 'Sure you want to quit showbridge?',
      buttons: ['Quit', 'Cancel'],
    })
    .then((resp) => {
      if (resp.response === 0) {
        if (showbridgeProcess) {
          restartProcess = false;
          if (showbridgeProcess.child) {
            showbridgeProcess.child.send({
              eventType: 'destroy',
            });
          }
        }
      }
    });
}

function createTray() {
  tray = new electron.Tray('assets/images/icon.png');
  tray.setIgnoreDoubleClickEvents(true);

  const menu = new electron.Menu();
  menu.append(
    new electron.MenuItem({
      label: 'Show/Hide Window',
      click: toggleWindow,
    })
  );
  menu.append(
    new electron.MenuItem({
      label: 'Quit',
      click: quitApp,
    })
  );
  tray.setContextMenu(menu);
}

function createWindow() {
  win = new BrowserWindow({
    width: 200,
    height: 200,
    frame: false,
    resizable: false,
    roundedCorners: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('index.html');
  // win.webContents.openDevTools();
}

function loadConfigFromFile(configPath) {
  if (fs.existsSync(configPath)) {
    try {
      const newConfigFile = fs.readFileSync(configPath);
      const newConfigObj = JSON.parse(newConfigFile);
      if (showbridgeProcess) {
        if (showbridgeProcess.child) {
          showbridgeProcess.child.send({
            eventType: 'check_config',
            config: newConfigObj,
          });
        }
      }
    } catch (error) {
      console.error(error);
      dialog.showErrorBox('Error', error.toString());
    }
  } else {
    dialog.showErrorBox('Error', `Cannot find file: ${path}`);
  }
}

app.whenReady().then(() => {
  configDir = path.join(app.getPath('appData'), '/showbridge/');
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
    console.log(rootPath);
    showbridgeProcess = respawn(
      () => ['node', path.join(rootPath, './dist/bundle/index.js'), '-c', configFilePath, `-t`],
      {
        name: 'showbridge process',
        maxRestarts: -1,
        sleep: 1000,
        kill: 5000,
        cwd: rootPath,
        stdio: [null, null, null, 'ipc'],
      }
    );

    showbridgeProcess.on('start', () => {
      if (showbridgeProcess.child) {
        // NOTE(jwetzell): setup listeners for
        showbridgeProcess.child.on('message', (message) => {
          // TODO(jwetzell): react to these messages visually
          switch (message.eventType) {
            case 'config_valid':
              dialog
                .showMessageBox(win, {
                  type: 'question',
                  buttons: ['Apply', 'Cancel'],
                  defaultId: 0,
                  title: 'Apply Config',
                  message: 'This looks like a valid config JSON. Would you like to apply it?',
                })
                .then((response) => {
                  if (response.response === 0) {
                    showbridgeProcess.child.send({
                      eventType: 'update_config',
                      config: message.config,
                    });
                  }
                });
              break;
            case 'config_error':
              console.error('problems with config');
              // TODO(jwetzell): format these errors better
              dialog.showErrorBox('Error', JSON.stringify(message.error.toString()));
              break;
            default:
              break;
          }
        });
      }
    });

    showbridgeProcess.on('stop', () => {
      console.log('process stop');
    });

    showbridgeProcess.on('spawn', () => {
      // TODO(jwetzell): catch loops in underlying command crashing
      console.log('process spawn');
    });

    showbridgeProcess.on('exit', (code) => {
      console.log(`process exit ${code}`);
      if (!restartProcess) {
        app.exit();
      }
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
  createTray();

  ipcMain.on('check_config', (event, file) => {
    loadConfigFromFile(file.path);
  });

  ipcMain.on('load_config', () => {
    dialog
      .showOpenDialog(win, {
        title: 'Open Config File',
        buttonLabel: 'Apply',
        filters: [{ name: 'json', extensions: ['json'] }],
        multiSelections: false,
      })
      .then((resp) => {
        if (!resp.canceled) {
          if (resp.filePaths.length > 0) {
            loadConfigFromFile(resp.filePaths[0]);
          }
        }
      });
  });

  ipcMain.on('quit', () => {
    quitApp();
  });

  app.on('activate', () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
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
