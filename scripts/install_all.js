import cp from 'child_process';
import os from 'os';
import path from 'path';

const projectFolders = [
  path.resolve(import.meta.dirname, '../lib'),
  path.resolve(import.meta.dirname, '../launcher'),
  path.resolve(import.meta.dirname, '../webui'),
  path.resolve(import.meta.dirname, '../cloud'),
  path.resolve(import.meta.dirname, '../site'),
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
