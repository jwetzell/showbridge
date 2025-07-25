/* eslint-disable import/no-extraneous-dependencies */
// NOTE(jwetzell): HEAVY inspiration from https://github.com/bitfocus/companion/launcher

const path = require('path');
const { app, BrowserWindow, dialog, ipcMain, Tray, Menu, MenuItem, shell, crashReporter } = require('electron');
const Tail = require('tail').Tail;
const {
  readJSONSync,
  existsSync,
  writeJSONSync,
  readdirSync,
  mkdirSync,
  ensureDirSync,
  copySync,
} = require('fs-extra');
const respawn = require('respawn');
const fileStreamRotator = require('file-stream-rotator');
const defaultConfig = require('@showbridge/cli/sample/config/default.json');
const defaultVars = require('@showbridge/cli/sample/vars/default.json');
const cliInfo = require('@showbridge/cli/package.json');
const launcherInfo = require('../package.json');

const rootPath = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');
let restartProcess = true;

let showbridgeProcess;
let mainWin;
let logWin;
let tray;
const configDir = path.join(app.getPath('appData'), '/showbridge/');
const backupDir = path.join(configDir, 'backups');
const configFilePath = path.join(configDir, 'config.json');
const varsFilePath = path.join(configDir, 'vars.json');
const logsDir = path.join(configDir, 'logs');

app.setPath('crashDumps', path.join(configDir, 'crashes'));
crashReporter.start({ uploadToServer: false });

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
let currentLogFileTail;

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
        eventName: 'destroy',
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
  if (mainWin) {
    mainWin.show();
  }

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
  logWin.loadFile(path.join(__dirname, 'html/logger.html'));
}

function showLogWindow() {
  if (logWin === undefined || logWin.isDestroyed()) {
    createLogWindow();
  } else {
    logWin.show();
    logWin.focus();
  }
}

function getVersions() {
  return {
    launcher: launcherInfo.version,
    cli: launcherInfo.dependencies['@showbridge/cli'],
    webui: cliInfo.dependencies['@showbridge/webui'],
    lib: cliInfo.dependencies['@showbridge/lib'],
  };
}

function showAboutWindow() {
  const message = Object.entries(getVersions())
    .map(([service, version]) => `${service}: ${version}`)
    .join('\n');
  dialog.showMessageBox(undefined, {
    title: 'About',
    message,
  });
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
  mainWin.loadFile(path.join(__dirname, 'html/main.html'));
}

function reloadMIDI() {
  if (showbridgeProcess && showbridgeProcess.child) {
    dialog
      .showMessageBox(mainWin, {
        type: 'question',
        buttons: ['Reload', 'Cancel'],
        defaultId: 0,
        title: 'Reload MIDI',
        message:
          'This will reload the MIDI protocol which, while quick, will drop any messages received while reloading.\n\nWould you like to reload?',
      })
      .then((response) => {
        if (response.response === 0) {
          showbridgeProcess.child.send({
            eventName: 'reloadProtocols',
            data: ['midi'],
          });
        }
      });
  }
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/images/icon16x16.png'));
  tray.setIgnoreDoubleClickEvents(true);

  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: 'About showbridge',
      click: showAboutWindow,
    })
  );
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
      label: 'Open Config Dir',
      click: () => {
        shell.openPath(configDir);
      },
    })
  );
  menu.append(
    new MenuItem({
      label: 'Reload MIDI',
      click: reloadMIDI,
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

function backup() {
  const now = Date.now();
  const filesToBackup = ['config.json', 'vars.json'];
  console.debug(`app: backup started @ ${now.toString()}`);

  const currentBackupDir = path.join(backupDir, now.toString());
  filesToBackup.forEach((filename) => {
    const fileToBackup = path.join(configDir, filename);
    console.debug(`app: backing up ${filename}`);
    try {
      if (existsSync(fileToBackup)) {
        ensureDirSync(currentBackupDir);
        copySync(fileToBackup, path.join(currentBackupDir, filename), { preserveTimestamps: true });
      } else {
        console.debug('app: file does not exist - excluding from backup');
      }
    } catch (error) {
      console.error(`app: backup error`);
      console.error(error);
      dialog.showErrorBox('Error', `Problem backing up config ${error}`);
    }
  });
}

function writeJSONToDisk(filePath, obj, skipBackup = false) {
  if (!skipBackup) {
    backup();
  }

  try {
    console.debug(`app: saving file - ${filePath}`);
    writeJSONSync(filePath, obj, {
      spaces: 2,
    });
  } catch (error) {
    dialog.showErrorBox('Error', `Problem saving file - ${error}`);
  }
}

function reloadConfigFromDisk(filePath) {
  if (filePath && existsSync(filePath)) {
    try {
      const config = readJSONSync(filePath);
      showbridgeProcess.child.send({
        eventName: 'updateConfig',
        data: config,
      });
    } catch (error) {
      dialog.showErrorBox('Error', error.toString());
    }
  } else {
    dialog.showErrorBox('Error', 'No config found on disk.');
  }
}

function getBackups() {
  if (backupDir) {
    const backupTimestamps = readdirSync(backupDir)
      .map((folder) => {
        try {
          return Number.parseInt(folder, 10);
        } catch (error) {
          return undefined;
        }
      })
      .filter((folder) => folder !== undefined);

    const backups = backupTimestamps.map((timestamp) => {
      const backupPath = path.join(backupDir, timestamp.toString());
      return {
        timestamp,
        files: readdirSync(backupPath),
        path: backupPath,
      };
    });
    return backups;
  }
  return [];
}

function loadConfigFromFile(filePath) {
  if (existsSync(filePath)) {
    try {
      const newConfigObj = readJSONSync(filePath);
      if (showbridgeProcess) {
        if (showbridgeProcess.child) {
          showbridgeProcess.child.send({
            eventName: 'checkConfig',
            data: newConfigObj,
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

function setupCurrentLogFileTail() {
  if (currentLogFile) {
    if (currentLogFileTail) {
      currentLogFileTail.unwatch();
    }
    currentLogFileTail = new Tail(currentLogFile, {
      fromBeginning: true,
    });
    currentLogFileTail.on('line', (data) => {
      if (logWin && !logWin.isDestroyed()) {
        logWin.webContents.send('log', data.toString());
      }
    });
  }
}

function loadCurrentLogFile() {
  if (logsDir) {
    const logFiles = readdirSync(logsDir).filter((filename) => filename.endsWith('.log'));
    logFiles.sort();
    if (logFiles.length > 0) {
      currentLogFile = path.join(logsDir, logFiles[logFiles.length - 1]);
    }
  }
}

function getShowbridgeLocation(isPackaged) {
  if (rootPath === undefined) {
    console.error('app: no rootPath cannot get showbridgePath');
    return null;
  }

  if (!isPackaged) {
    return path.join(rootPath, '../cli/main.js');
  }
  return require.resolve('@showbridge/cli');
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

  loadCurrentLogFile();

  console.log(`app: config dir exists: ${existsSync(configDir)}`);

  if (!existsSync(configDir)) {
    mkdirSync(configDir);
  }

  if (!existsSync(backupDir)) {
    mkdirSync(backupDir);
  }

  console.log(`app: config file exists: ${existsSync(configFilePath)}`);

  console.log(`app: ${app.isPackaged ? 'is' : 'is not'} packaged: `);

  if (!existsSync(configFilePath)) {
    console.log('app: populating config.json with default config');
    writeJSONToDisk(configFilePath, defaultConfig, true);
  }

  if (!existsSync(varsFilePath)) {
    console.log('app: populating vars.json with default vars');
    writeJSONToDisk(varsFilePath, defaultVars, true);
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
        () => [
          showbridgePath,
          '--config',
          configFilePath,
          '--vars',
          varsFilePath,
          '-l',
          app.isPackaged ? 'info' : 'trace',
        ],
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
            switch (message.eventName) {
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
                      writeJSONToDisk(configFilePath, message.data);
                      reloadConfigFromDisk(configFilePath);
                    }
                  });
                break;
              case 'configError':
                // TODO(jwetzell): format these errors better
                mainWin.webContents.send('configError', message.data);
                dialog.showErrorBox('Error', message.data.map((error) => error.message).join('\n'));
                break;
              case 'configUpdated':
                writeJSONToDisk(configFilePath, message.data);
                break;
              case 'varsUpdated':
                writeJSONToDisk(varsFilePath, message.data);
                break;
              case 'messageIn':
                if (routerLogStream) {
                  routerLogStream.write(`${JSON.stringify(message.data)}\n`);
                }
                if (mainWin && mainWin.isVisible()) {
                  mainWin.webContents.send('messageIn', message.data);
                }
                break;
              case 'trigger':
              case 'action':
              case 'transform':
                if (routerLogStream) {
                  routerLogStream.write(`${JSON.stringify(message.data)}\n`);
                }
                break;
              case 'protocolStarted':
                if (mainWin) {
                  mainWin.webContents.send('protocolStarted', message.data);
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
            buttons: ['Quit', 'Open Logs'],
          })
          .then((resp) => {
            if (resp.response === 0) {
              shutdown();
            } else {
              shell.openPath(logsDir);
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

    ipcMain.handle('getBackups', () => {
      console.log('app: get backups called');
      const backups = getBackups();
      return backups;
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
      getBackups();
    });

    ipcMain.on('logWinLoaded', () => {
      loadCurrentLogFile();
      setupCurrentLogFileTail();
    });

    ipcMain.on('showUI', () => {
      try {
        // TODO(jwetzell): get this value from the running config not just the file on disk
        const config = readJSONSync(configFilePath);
        if (config.http?.params?.port) {
          let addressToOpen = 'localhost';
          if (config.http.params.address !== undefined && config.http.params.address !== '0.0.0.0') {
            addressToOpen = config.http.params.address;
          }
          shell.openExternal(`http://${addressToOpen}:${config.http.params.port}`);
        } else if (config.protocols?.http?.params?.port) {
          let addressToOpen = 'localhost';
          if (
            config.protocols.http.params.address !== undefined &&
            config.protocols.http.params.address !== '0.0.0.0'
          ) {
            addressToOpen = config.protocols.http.params.address;
          }
          shell.openExternal(`http://${addressToOpen}:${config.protocols.http.params.port}`);
        } else {
          dialog.showErrorBox('Error', 'HTTP server does not seem to be setup right.');
        }
      } catch (error) {
        console.error(error);
        dialog.showErrorBox('Error', 'Problem determining current router settings');
      }
    });
  });
}

app.on('will-quit', () => {
  console.log('app: will quit');
  shutdown();
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

app.on('second-instance', () => {
  if (mainWin) {
    mainWin.show();
  }
});
