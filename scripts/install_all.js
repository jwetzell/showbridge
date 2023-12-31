const cp = require('child_process');
const path = require('path');
const os = require('os');

const projectFolders = [
  path.resolve(__dirname, '../lib'),
  path.resolve(__dirname, '../launcher'),
  path.resolve(__dirname, '../webui'),
  path.resolve(__dirname, '../cloud'),
];

projectFolders.forEach((projectFolder) => {
  console.log(`spawning npm ci process for ${projectFolder}`);
  cp.spawn(os.platform() === 'win32' ? 'npm.cmd' : 'npm', ['ci'], {
    env: process.env,
    cwd: projectFolder,
    stdio: 'inherit',
  });
});
