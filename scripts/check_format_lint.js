const cp = require('child_process');

const eslintPaths = ['./lib', './cloud', './tests', './launcher', './main.js'];

const pathsWithErrors = [];

console.log(`Running eslint on:\n${eslintPaths.join('\n')}`);
eslintPaths.forEach((path) => {
  const eslintProcess = cp.spawnSync('eslint', [path], {
    stdio: 'inherit',
  });

  if (eslintProcess.error || eslintProcess.status > 0) {
    pathsWithErrors.push(path);
  }
});

if (pathsWithErrors.length > 0) {
  console.error(`The following paths have formatting or linting errors: ${pathsWithErrors.join(', ')}`);
  process.exit(1);
} else {
  console.log('No formatting or linting errors found.');
}
