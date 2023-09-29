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

const rootPath = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');

let restartProcess = true;

let showbridgeProcess;
let mainWin;
let logWin;
let settingsWin;
let tray;
const configDir = path.join(app.getPath('appData'), '/showbridge/');
const configFilePath = path.join(configDir, 'config.json');
const logsDir = path.join(configDir, 'logs');
const showbridgeLogStream = fileStreamRotator.getStream({
  filename: path.join(logsDir, 'showbridge-%DATE%'),
  extension: '.log',
  frequency: 'daily',
  date_format: 'YYYY-MM-DD',
  size: '100m',
  max_logs: '7d',
  audit_file: path.join(logsDir, 'showbridge-audit.json'),
  stdio: true,
});

const routerLogStream = fileStreamRotator.getStream({
  filename: path.join(logsDir, 'router-%DATE%'),
  extension: '.log',
  frequency: 'daily',
  date_format: 'YYYY-MM-DD',
  size: '100m',
  max_logs: '7d',
  audit_file: path.join(logsDir, 'router-audit.json'),
});

let currentLogFile;

function toggleWindow(window) {
  if (window.isVisible()) {
    window.hide();
  } else {
    window.show();
    window.focus();
  }
}

function shutdown() {
  if (showbridgeProcess) {
    if (showbridgeProcess.status !== 'running') {
      app.quit();
    } else if (showbridgeProcess.child) {
      console.log('app: sending destroy to showbridge process');
      restartProcess = false;
      showbridgeProcess.child.send({
        eventType: 'destroy',
      });
    } else {
      console.log('app: could not determine how to safely shutdown closing app right away');
      app.quit();
    }
  } else {
    console.log('app: could not determine how to safely shutdown closing app right away');
    app.quit();
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
        shutdown();
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
  logWin.loadFile('html/logger.html');
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
  settingsWin.loadFile('html/settings.html');
}

function showLogWindow() {
  if (logWin === undefined || logWin.isDestroyed()) {
    createLogWindow();
  } else {
    logWin.show();
    logWin.focus();
  }
}

function showSettingsWindow() {
  if (settingsWin === undefined || settingsWin.isDestroyed()) {
    createSettingsWindow();
  } else {
    settingsWin.show();
    settingsWin.focus();
  }
}

function createMainWindow() {
  mainWin = new BrowserWindow({
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
  mainWin.loadFile('index.html');
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
      click: () => {
        toggleWindow(mainWin);
      },
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
        mainWin.webContents.openDevTools({
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
    console.log('app: backing up current config');
    try {
      fs.moveSync(filePath, `${filePath}.${Date.now()}.bak`, {
        overwrite: true,
      });
    } catch (error) {
      dialog.showErrorBox('Error', `Problem backing up config ${error}`);
    }
  }

  try {
    console.log('app: saving new config');
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
        eventType: 'updateConfig',
        config,
      });
    } catch (error) {
      dialog.showErrorBox('Error', error.toString());
    }
  } else {
    dialog.showErrorBox('Error', 'No config found on disk.');
  }
}

// TODO(jwetzell): add ability to load backup JSON files
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
          console.error('app: config file not formatted normally');
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
            eventType: 'checkConfig',
            config: newConfigObj,
          });
        }
      }
    } catch (error) {
      dialog.showErrorBox('Error', error.toString());
    }
  } else {
    dialog.showErrorBox('Error', `Cannot find file: ${filePath}`);
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

function getShowbridgeLocation(isPackaged) {
  let showbridgePath = null;

  if (!isPackaged) {
    showbridgePath = './main.js';
  } else {
    showbridgePath = './dist/bundle/index.js';
  }

  return path.join(rootPath, showbridgePath);
}

const lock = app.requestSingleInstanceLock();

if (!lock) {
  dialog.showErrorBox(
    'Already Running?',
    'Looks like showbridge is already running. Only one instance at a time is allowed.'
  );
  shutdown();
} else {
  // TODO(jwetzell): add logging for launcher logs.
  // TODO(jwetzell): add menu links to open the config directory

  loadCurrentLogFile();

  console.log(`app: config dir exists: ${fs.existsSync(configDir)}`);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  console.log(`app: config file exists: ${fs.existsSync(configFilePath)}`);

  console.log(`app: ${app.isPackaged ? 'is' : 'is not'} packaged: `);

  if (!fs.existsSync(configFilePath)) {
    console.log('app: populating config.json with default config');
    writeConfigToDisk(configFilePath, defaultConfig);
  }

  app.whenReady().then(() => {
    if (!lock) {
      console.error('app: showbridge already running skipping setup');
      return;
    }

    try {
      createMainWindow();
      createTray();

      const showbridgePath = getShowbridgeLocation(app.isPackaged);

      if (!showbridgePath) {
        dialog.showErrorBox('Unable to start', 'Failed to find showbridge app to run');
        app.exit(11);
      }

      showbridgeProcess = respawn(
        () => [showbridgePath, '--config', configFilePath, '--webui', './dist/webui', app.isPackaged ? '' : '--trace'],
        {
          name: 'showbridge process',
          maxRestarts: 3,
          sleep: 500,
          kill: 5000,
          cwd: rootPath,
          stdio: [null, null, null, 'ipc'],
          fork: true,
        }
      );

      showbridgeProcess.on('start', () => {
        if (showbridgeProcess.child) {
          showbridgeProcess.child.on('message', (message) => {
            switch (message.eventType) {
              case 'configValid':
                dialog
                  .showMessageBox(mainWin, {
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
              case 'configError':
                // TODO(jwetzell): format these errors better
                mainWin.webContents.send('configError', message.errors);
                dialog.showErrorBox('Error', message.errors.map((error) => error.message).join('\n'));
                break;
              case 'configUpdated':
                // TODO(jwetzell): add rollback
                writeConfigToDisk(configFilePath, message.config);
                break;
              case 'messageIn':
                if (routerLogStream) {
                  routerLogStream.write(`${JSON.stringify(message)}\n`);
                }
                if (mainWin && mainWin.isVisible()) {
                  mainWin.webContents.send('messageIn', message.message);
                }
                break;
              case 'trigger':
              case 'action':
              case 'transform':
                if (routerLogStream) {
                  routerLogStream.write(`${JSON.stringify(message)}\n`);
                }
                break;
              default:
                console.error(`app: unhandled message from showbridge process`);
                console.error(message);
                break;
            }
          });
        }
      });

      showbridgeProcess.on('stop', () => {
        console.log('app: showbridge process stopped');
      });

      showbridgeProcess.on('spawn', () => {
        console.log('app: showbridge process spawned');
      });

      showbridgeProcess.on('exit', (code) => {
        console.log(`app: showbridge process exited: ${code}`);
        if (!restartProcess) {
          app.quit();
        }
      });

      showbridgeProcess.on('crash', () => {
        console.log('app: showbridge process crashed');
        // TODO(jwetzell): Add some instructions for users to either report or diagnose
        dialog
          .showMessageBox(undefined, {
            title: 'showbridge',
            message: 'Showbridge process has crashed. Check logs',
            buttons: ['Ok'],
          })
          .then((resp) => {
            if (resp.response === 0) {
              shutdown();
            }
          });
      });

      showbridgeProcess.on('stdout', (data) => {
        if (showbridgeLogStream) {
          showbridgeLogStream.write(data);
        }
      });

      showbridgeProcess.on('stderr', (data) => {
        if (showbridgeLogStream) {
          showbridgeLogStream.write(data);
        }
      });

      showbridgeProcess.on('warn', (err) => {
        console.error(err);
      });

      showbridgeProcess.start();
    } catch (error) {
      dialog.showErrorBox('Error', error);
    }

    ipcMain.handle('getConfigBackups', () => {
      console.log('app: get config backups called');
      const configBackups = getConfigBackupList();
      return configBackups;
    });

    // NOTE(jwetzell) load config file from drag/drop
    ipcMain.on('loadConfigFromFile', (event, file) => {
      loadConfigFromFile(file.path);
    });

    // NOTE(jwetzell) open config file from file browser
    ipcMain.on('loadConfigFromFileBrowser', () => {
      dialog
        .showOpenDialog(mainWin, {
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

    ipcMain.on('showLogs', () => {
      showLogWindow();
    });

    ipcMain.on('logWinLoaded', () => {
      loadCurrentLogFile();
      if (currentLogFile) {
        const tail = new Tail(currentLogFile, {
          fromBeginning: true,
        });
        tail.on('line', (data) => {
          console.log(data);
          if (logWin && !logWin.isDestroyed()) {
            logWin.webContents.send('log', data.toString());
          }
        });
      } else {
        console.error('app: current log file not set');
      }
    });

    ipcMain.on('showSettings', () => {
      showSettingsWindow();
    });

    ipcMain.on('showUI', () => {
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

    ipcMain.handle('getIPAddresses', () => getIPAddresses());

    ipcMain.handle('getCurrentConfig', () => getConfigObject(configFilePath));

    ipcMain.on('loadConfigFromObject', (event, config) => {
      writeConfigToDisk(configFilePath, config);
      // TODO(jwetzell): error handling
      reloadConfigFromDisk(configFilePath);
    });
  });
}

app.on('will-quit', () => {
  console.log('app: will quit');
});

app.on('window-all-closed', () => {
  console.log('app: window all closed');
  shutdown();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
