// NOTE(jwetzell): HEAVY inspiration from https://github.com/bitfocus/companion/launcher

const { app, BrowserWindow, dialog, ipcMain, Tray, Menu, MenuItem, shell } = require('electron');

const path = require('path');
const fs = require('fs-extra');
const respawn = require('respawn');
const defaultConfig = require('../config/default.json');

let rootPath = process.resourcesPath;

let restartProcess = true;

let showbridgeProcess;
let win;
let logWin;
let tray;
let configDir;
let configFilePath;

function toggleWindow() {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}

function quitApp() {
  dialog
    .showMessageBox(undefined, {
      title: 'showbridge',
      message: 'Are you sure you want to quit showbridge?',
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

function createLogWindow() {
  logWin = new BrowserWindow({
    width: 700,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  logWin.removeMenu();
  logWin.loadFile('logger.html');
  // logWin.webContents.openDevTools();
}

function createWindow() {
  win = new BrowserWindow({
    width: 200,
    height: 200,
    frame: false,
    resizable: false,
    roundedCorners: true,
    transparent: true,
    icon: path.join(__dirname, './assets/images/icon512x512.png'),
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('index.html');
  // win.webContents.openDevTools();
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/images/icon16x16.png'));
  tray.setIgnoreDoubleClickEvents(true);

  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: 'Show/Hide Window',
      click: toggleWindow,
    })
  );
  menu.append(
    new MenuItem({
      label: 'View Logs',
      click: createLogWindow,
    })
  );
  menu.append(
    new MenuItem({
      label: 'Quit',
      click: quitApp,
    })
  );
  tray.setContextMenu(menu);
}

function writeConfigToDisk(filePath, configObj) {
  // TODO(jwetzell): add error handling
  if (fs.existsSync(filePath)) {
    console.log('backing up current config');
    try {
      fs.moveSync(filePath, `${filePath}.bak`, {
        overwrite: true,
      });
    } catch (error) {
      dialog.showErrorBox('Error', `Problem backing up config ${error}`);
    }
  }

  try {
    console.log('saving new config');
    fs.writeJSONSync(filePath, configObj, {
      spaces: 2,
    });
  } catch (error) {
    dialog.showErrorBox('Error', `Problem saving up config ${error}`);
  }
}

function reloadConfigFromDisk() {
  if (configFilePath && fs.existsSync(configFilePath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configFilePath));
      showbridgeProcess.child.send({
        eventType: 'update_config',
        config,
      });
    } catch (error) {
      dialog.showErrorBox('Error', error.toString());
    }
  } else {
    dialog.showErrorBox('Error', 'No config found on disk.');
  }
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
  configFilePath = path.join(configDir, 'config.json');
  console.log(`config file exists: ${fs.existsSync(configFilePath)}`);

  console.log(`app is packaged: ${app.isPackaged}`);

  if (!fs.existsSync(configFilePath)) {
    console.log('populating config.json with default config');
    writeConfigToDisk(configFilePath, defaultConfig);
  }

  try {
    createWindow();
    createTray();

    rootPath = process.resourcesPath;
    if (!app.isPackaged) {
      rootPath = path.join(__dirname, '..');
    }

    let nodeBin = null;

    if (!app.isPackaged) {
      nodeBin = 'node';
    } else {
      const nodeBinPath = process.platform === 'win32' ? 'node/node.exe' : 'node/bin/node';

      const potentialNodePath = path.join(rootPath, nodeBinPath);

      if (fs.pathExistsSync(potentialNodePath)) {
        nodeBin = potentialNodePath;
      }
    }

    if (!nodeBin) {
      dialog.showErrorBox('Unable to start', 'Failed to find node binary to run');
      app.exit(11);
    }

    showbridgeProcess = respawn(
      () => [nodeBin, path.join(rootPath, './dist/bundle/index.js'), '-c', configFilePath, '-h', './webui'],
      {
        name: 'showbridge process',
        maxRestarts: 3,
        sleep: 1000,
        kill: 5000,
        cwd: rootPath,
        stdio: [null, null, null, 'ipc'],
      }
    );

    showbridgeProcess.on('start', () => {
      if (showbridgeProcess.child) {
        showbridgeProcess.child.on('message', (message) => {
          console.log(message.eventType);
          switch (message.eventType) {
            case 'config_valid':
              dialog
                .showMessageBox(win, {
                  type: 'question',
                  buttons: ['Apply', 'Cancel'],
                  defaultId: 0,
                  title: 'Apply Config',
                  message: 'This looks like a valid config JSON file. Would you like to apply it?',
                })
                .then((response) => {
                  if (response.response === 0) {
                    writeConfigToDisk(configFilePath, message.config);
                    reloadConfigFromDisk();
                  }
                });
              break;
            case 'config_error':
              // TODO(jwetzell): format these errors better
              win.webContents.send('config_error', message.errors);
              dialog.showErrorBox('Error', message.errors.map((error) => error.message).join('\n'));
              break;
            case 'config_updated':
              // TODO(jwetzell): add rollback
              writeConfigToDisk(configFilePath, message.config);
              break;
            default:
              console.error(`unhandled message from showbridge process`);
              console.error(message);
              break;
          }
        });
      }
    });

    showbridgeProcess.on('stop', () => {
      console.log('showbridge process stopped');
    });

    showbridgeProcess.on('spawn', () => {
      // TODO(jwetzell): catch loops in underlying command crashing
      console.log('showbridge process spawned');
    });

    showbridgeProcess.on('exit', (code) => {
      console.log(`showbridge process exited: ${code}`);
      if (!restartProcess) {
        // TODO(jwetzell) figure out why this doesn't exit on built mac app
        app.exit();
      }
    });

    showbridgeProcess.on('stdout', (data) => {
      console.log(data.toString());
      if (logWin && !logWin.isDestroyed()) {
        logWin.webContents.send('log', data.toString());
      }
    });

    showbridgeProcess.on('stderr', (data) => {
      console.error(data.toString());
      if (logWin && !logWin.isDestroyed()) {
        logWin.webContents.send('log', data.toString());
      }
    });

    showbridgeProcess.on('warn', (err) => {
      console.error(err);
    });

    showbridgeProcess.start();
  } catch (error) {
    dialog.showErrorBox('Error', error);
  }

  // NOTE(jwetzell) load config file from drag/drop
  ipcMain.on('check_config', (event, file) => {
    loadConfigFromFile(file.path);
  });

  // NOTE(jwetzell) open config file from file browser
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

  ipcMain.on('show_logs', () => {
    if (logWin === undefined || logWin.isDestroyed()) {
      createLogWindow();
    } else {
      logWin.show();
      logWin.focus();
    }
  });

  ipcMain.on('show_ui', () => {
    try {
      const config = fs.readJSONSync(configFilePath);
      if (config.http.params.port) {
        // TODO(jwetzell)
        shell.openExternal(
          `http://${config.http.params.address ? config.http.params.address : 'localhost'}:${config.http.params.port}`
        );
      } else {
        dialog.showErrorBox('Error', 'HTTP server does not seem to be setup right.');
      }
    } catch (error) {
      dialog.showErrorBox('Error', 'Problem determining current router settings');
    }
  });
});

app.on('will-quit', () => {
  console.log('app will quit');
  if (showbridgeProcess) {
    restartProcess = false;
    if (showbridgeProcess.child) {
      showbridgeProcess.child.send({
        eventType: 'destroy',
      });
    }
  }
});

app.on('window-all-closed', () => {
  if (showbridgeProcess) {
    restartProcess = false;
    if (showbridgeProcess.child) {
      showbridgeProcess.child.send({
        eventType: 'destroy',
      });
    }
  }
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
