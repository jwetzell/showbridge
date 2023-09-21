/* eslint-disable import/no-extraneous-dependencies */
// NOTE(jwetzell): HEAVY inspiration from https://github.com/bitfocus/companion/launcher

const path = require('path');
const { networkInterfaces } = require('os');
const { app, BrowserWindow, dialog, ipcMain, Tray, Menu, MenuItem, shell } = require('electron');

const Tail = require('tail').Tail;
const fs = require('fs-extra');
const respawn = require('respawn');
const fileStreamRotator = require('file-stream-rotator');
const defaultConfig = require('../config/default.json');

let rootPath = process.resourcesPath;

let restartProcess = true;

let showbridgeProcess;
let win;
let logWin;
let settingsWin;
let tray;
let configDir;
let configFilePath;
let logsDir;
let rotatingLogStream;
let currentLogFile;

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

function showLogWindow() {
  if (logWin === undefined || logWin.isDestroyed()) {
    createLogWindow();
  } else {
    logWin.show();
    logWin.focus();
  }
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
}

function createSettingsWindow() {
  settingsWin = new BrowserWindow({
    width: 450,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  settingsWin.removeMenu();
  settingsWin.loadFile('settings.html');
}

function showSettingsWindow() {
  if (settingsWin === undefined || settingsWin.isDestroyed()) {
    createSettingsWindow();
  } else {
    settingsWin.show();
    settingsWin.focus();
  }
}

function getIPAddresses() {
  const allInterfaces = networkInterfaces();
  const validAddresses = [];
  Object.values(allInterfaces).forEach((addresses) => {
    const goodAddresses = addresses.filter((address) => !address.internal);
    validAddresses.push(...goodAddresses);
  });
  return validAddresses;
}

function getConfigObject(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.readJsonSync(filePath);
  }
  return undefined;
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
      click: showLogWindow,
    })
  );
  menu.append(
    new MenuItem({
      label: 'Open DevTools',
      click: () => {
        win.webContents.openDevTools({
          mode: 'detach',
        });
      },
    })
  );
  menu.append(
    new MenuItem({
      label: 'Settings',
      click: showSettingsWindow,
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
      fs.moveSync(filePath, `${filePath}.${Date.now()}.bak`, {
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

function reloadConfigFromDisk(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      const config = JSON.parse(fs.readFileSync(filePath));
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

function getConfigBackupList() {
  if (configDir) {
    const files = fs.readdirSync(configDir).filter((file) => file.startsWith('config.json.'));
    const configBackups = files.map((fileName) => {
      let configBackupDate;
      const fileNameParts = fileName.split('.');
      if (fileNameParts.length === 4) {
        try {
          configBackupDate = parseInt(fileNameParts[2], 10);
        } catch (error) {
          console.error('config file not formatted normally');
        }
      }
      return {
        filePath: path.join(configDir, fileName),
        timestamp: configBackupDate,
      };
    });
    return configBackups;
  }
  return [];
}

function loadConfigFromFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const newConfigFile = fs.readFileSync(filePath);
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

function loadCurrentLogFile() {
  if (logsDir) {
    const logFiles = fs.readdirSync(logsDir).filter((filename) => filename.endsWith('.log'));
    logFiles.sort();
    if (logFiles.length > 0) {
      currentLogFile = path.join(logsDir, logFiles[logFiles.length - 1]);
    }
  }
}

function getNodeBinaryLocation(isPackaged) {
  let nodeBin = null;

  if (!isPackaged) {
    nodeBin = 'node';
  } else {
    const nodeBinPath = process.platform === 'win32' ? 'node/node.exe' : 'node/bin/node';

    const potentialNodePath = path.join(rootPath, nodeBinPath);

    if (fs.pathExistsSync(potentialNodePath)) {
      nodeBin = potentialNodePath;
    }
  }
  return nodeBin;
}

function getShowbridgeLocation(isPackaged) {
  let showbridgePath = null;

  if (!isPackaged) {
    showbridgePath = './main.js';
  } else {
    showbridgePath = './showbridge/main.js';
  }

  return showbridgePath;
}

const lock = app.requestSingleInstanceLock();

if (!lock) {
  dialog.showErrorBox(
    'Already Running?',
    'Looks like showbridge is already running. Only one instance at a time is allowed.'
  );
  app.quit();
} else {
  configDir = path.join(app.getPath('appData'), '/showbridge/');
  logsDir = path.join(configDir, 'logs');
  // TODO(jwetzell): add logging for launcher logs. Use these log files for the logs view
  // TODO(jwetzell): add menu links to open the config directory
  rotatingLogStream = fileStreamRotator.getStream({
    filename: path.join(logsDir, 'showbridge-%DATE%'),
    extension: '.log',
    frequency: 'daily',
    date_format: 'YYYY-MM-DD',
    size: '100m',
    max_logs: '7d',
    audit_file: path.join(logsDir, 'audit.json'),
  });

  loadCurrentLogFile();

  console.log(`config dir exists: ${fs.existsSync(configDir)}`);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  configFilePath = path.join(configDir, 'config.json');
  console.log(`config file exists: ${fs.existsSync(configFilePath)}`);

  rootPath = process.resourcesPath;
  if (!app.isPackaged) {
    rootPath = path.join(__dirname, '..');
  }

  console.log(`app is packaged: ${app.isPackaged}`);

  if (!fs.existsSync(configFilePath)) {
    console.log('populating config.json with default config');
    writeConfigToDisk(configFilePath, defaultConfig);
  }

  app.whenReady().then(() => {
    if (!lock) {
      console.error('showbridge already running skipping setup');
      return;
    }

    try {
      createWindow();
      createTray();

      const nodeBin = getNodeBinaryLocation(app.isPackaged);

      if (!nodeBin) {
        dialog.showErrorBox('Unable to start', 'Failed to find node binary to run');
        app.exit(11);
      }

      const showbridgePath = getShowbridgeLocation(app.isPackaged);

      if (!showbridgePath) {
        dialog.showErrorBox('Unable to start', 'Failed to find showbridge app to run');
        app.exit(11);
      }

      showbridgeProcess = respawn(
        () => [
          nodeBin,
          path.join(rootPath, showbridgePath),
          '--config',
          configFilePath,
          '--webui',
          './dist/webui',
          '--trace',
        ],
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
                      reloadConfigFromDisk(configFilePath);
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
              case 'message':
                if (win && win.isVisible()) {
                  win.webContents.send('message', message.message);
                }
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
          app.exit();
        }
      });

      showbridgeProcess.on('stdout', (data) => {
        if (rotatingLogStream) {
          rotatingLogStream.write(data);
        }
      });

      showbridgeProcess.on('stderr', (data) => {
        if (rotatingLogStream) {
          rotatingLogStream.write(data);
        }
      });

      showbridgeProcess.on('warn', (err) => {
        console.error(err);
      });

      showbridgeProcess.start();
    } catch (error) {
      dialog.showErrorBox('Error', error);
    }

    ipcMain.on('get_config_backups', () => {
      if (win && win.isVisible()) {
        console.log('get config backups called');
        const configBackups = getConfigBackupList();

        win.webContents.send('config_backups', configBackups);
      }
    });

    // NOTE(jwetzell) load config file from drag/drop
    ipcMain.on('check_config', (event, file) => {
      loadConfigFromFile(file.path);
    });

    // NOTE(jwetzell) open config file from file browser
    ipcMain.on('load_config_from_file', () => {
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
      showLogWindow();
    });

    ipcMain.on('log_win_loaded', () => {
      loadCurrentLogFile();
      if (currentLogFile) {
        const tail = new Tail(currentLogFile, {
          fromBeginning: true,
        });
        tail.on('line', (data) => {
          if (logWin && !logWin.isDestroyed()) {
            logWin.webContents.send('log', data.toString());
          }
        });
      } else {
        console.error('current log file not set');
      }
    });

    ipcMain.on('show_settings', () => {
      showSettingsWindow();
    });

    ipcMain.on('show_ui', () => {
      try {
        const config = fs.readJSONSync(configFilePath);
        if (config.http.params.port) {
          let addressToOpen = 'localhost';
          if (config.http.params.address !== undefined && config.http.params.address !== '0.0.0.0') {
            addressToOpen = config.http.params.address;
          }
          shell.openExternal(`http://${addressToOpen}:${config.http.params.port}`);
        } else {
          dialog.showErrorBox('Error', 'HTTP server does not seem to be setup right.');
        }
      } catch (error) {
        dialog.showErrorBox('Error', 'Problem determining current router settings');
      }
    });

    ipcMain.on('load_addresses', () => {
      if (settingsWin && settingsWin.isVisible()) {
        settingsWin.webContents.send('ip_addresses', getIPAddresses());
      }
    });

    ipcMain.on('load_current_config', () => {
      if (settingsWin && settingsWin.isVisible()) {
        settingsWin.webContents.send('current_config', getConfigObject(configFilePath));
      }
    });

    ipcMain.on('apply_config_from_object', (event, config) => {
      writeConfigToDisk(configFilePath, config);
      // TODO(jwetzell): error handling
      reloadConfigFromDisk(configFilePath);
    });
  });
}

// TODO(jwetzell): better quiting logic as it doesn't always seem to quit right
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
  console.log('app window all closed');
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
