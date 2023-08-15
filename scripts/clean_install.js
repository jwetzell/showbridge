const cp = require('child_process');
const path = require('path');
const { rimrafSync } = require('rimraf');

const projectFolders = [
  path.resolve(__dirname, '../lib'),
  path.resolve(__dirname, '../launcher'),
  path.resolve(__dirname, '../webui'),
];
const modulefolders = projectFolders.map((projectFolder) => path.join(projectFolder, 'node_modules'));

console.log('removing node_modules folders');
rimrafSync(modulefolders);

projectFolders.forEach((projectFolder) => {
  console.log(`spawning npm ci process for ${projectFolder}`);
  cp.spawn('npm', ['ci'], { env: process.env, cwd: projectFolder, stdio: 'inherit' });
});
