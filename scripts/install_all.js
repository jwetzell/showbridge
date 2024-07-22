import cp from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const projectFolders = [
  path.resolve(import.meta.dirname, '../cli'),
  path.resolve(import.meta.dirname, '../cloud'),
  path.resolve(import.meta.dirname, '../docs'),
  path.resolve(import.meta.dirname, '../launcher'),
  path.resolve(import.meta.dirname, '../lib'),
  path.resolve(import.meta.dirname, '../site'),
  path.resolve(import.meta.dirname, '../types'),
  path.resolve(import.meta.dirname, '../webui'),
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
