const { execSync } = require('child_process');
const { readJSONSync } = require('fs-extra');
const path = require('path');

const libraries = [
  {
    libraryPath: '../lib',
    linkPaths: ['../', '../launcher'],
  },
];

libraries.forEach((library) => {
  const libraryPath = path.join(__dirname, library.libraryPath);
  const libraryInfo = readJSONSync(path.join(libraryPath, 'package.json'));
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
