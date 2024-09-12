import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'node:path';

const projectRoot = path.join(import.meta.dirname, '../');
let folder = '';

if (process.argv.length === 3) {
  folder = path.join(projectRoot, process.argv[2]);
} else {
  console.error('must pass folder to setup as argument');
  process.exit(1);
}
if (folder === '') {
  console.error('must pass folder to setup as argument');
  process.exit(1);
}

const libraryInfo = JSON.parse(readFileSync(path.join(folder, 'package.json')));

console.log(`setting up dev for ${libraryInfo.name}`);

const showbridgeDependencies = Object.keys(libraryInfo.dependencies).filter((pkg) => pkg.startsWith('@showbridge'));

if (showbridgeDependencies.length === 0) {
  console.error('no showbridge dependencies found in requested folder');
  process.exit(1);
}

const libraries = showbridgeDependencies.map((pkg) => pkg.replace('@showbridge/', ''));

libraries.forEach((library) => {
  const libraryPath = path.join(projectRoot, library);
  if (existsSync(path.join(libraryPath, 'setup_dev.js'))) {
    execSync(`cd ${libraryPath} && npm run build && node setup_dev.js`);
  }
  console.log(`building and linking ${library}`);
  execSync(`cd ${libraryPath} && npm run build:dev && npm link`, {
    stdio: 'inherit',
  });
});

execSync(`cd ${folder} && npm link ${showbridgeDependencies.join(' ')}`, {
  stdio: 'inherit',
});

if (existsSync(path.join(folder, 'setup_dev.js'))) {
  execSync(`cd ${folder} && node setup_dev.js`);
}
