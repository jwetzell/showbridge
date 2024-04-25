import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

const libraries = [
  {
    libraryPath: '../lib',
    linkPaths: ['../', '../launcher'],
  },
  {
    libraryPath: '../',
    linkPaths: ['../launcher'],
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
