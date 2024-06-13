import { readFileSync } from 'fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const libraries = [
  {
    libraryPath: '../lib',
    linkPaths: ['../cli', '../launcher'],
  },
  {
    libraryPath: '../cli',
    linkPaths: ['../launcher'],
  },
  {
    libraryPath: '../webui',
    linkPaths: ['../cli'],
  },
];

libraries.forEach((library) => {
  const libraryPath = path.join(import.meta.dirname, library.libraryPath);
  const libraryInfo = JSON.parse(readFileSync(path.join(libraryPath, 'package.json')));
  execSync(`cd ${libraryPath} && npm link`, {
    stdio: 'inherit',
  });

  library.linkPaths.forEach((project) => {
    const projectPath = path.join(import.meta.dirname, project);
    execSync(`cd ${projectPath} && npm link ${libraryInfo.name}`, {
      stdio: 'inherit',
    });
  });
});
