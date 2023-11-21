const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const path = require('path');

const libraries = [
  {
    libraryPath: '../lib',
    linkPaths: ['../', '../launcher'],
  }
];

libraries.forEach((library) => {
  const libraryPath = path.join(__dirname, library.libraryPath);
  const libraryInfo = JSON.parse(readFileSync(path.join(libraryPath, 'package.json')));
  execSync(`cd ${libraryPath} && npm link`, {
    stdio: 'inherit',
  });

  library.linkPaths.forEach((project) => {
    const projectPath = path.join(__dirname, project);
    execSync(`cd ${projectPath} && npm link ${libraryInfo.name}`, {
      stdio: 'inherit',
    });
  });
});
