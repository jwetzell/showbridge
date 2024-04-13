const cp = require('child_process');
const path = require('path');
const os = require('os');

const projectFolders = [
  path.resolve(__dirname, '../lib'),
  path.resolve(__dirname, '../launcher'),
  path.resolve(__dirname, '../webui'),
  path.resolve(__dirname, '../cloud'),
];

const processes = [];

projectFolders.forEach((projectFolder) => {
  console.log(`spawning npm ci process for ${projectFolder}`);
  const childProcess = cp.spawn(os.platform() === 'win32' ? 'npm.cmd' : 'npm', ['ci'], {
    env: process.env,
    cwd: projectFolder,
    stdio: 'inherit',
  });
  processes.push(childProcess);
});

process.on('SIGINT', () => {
  console.log();
  console.log('killing processes');
  console.log();
  processes.forEach((process) => {
    process.kill('SIGINT');
  });
});
