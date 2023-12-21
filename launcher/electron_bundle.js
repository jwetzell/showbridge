const { execSync } = require('child_process');

// eslint-disable-next-line no-unused-vars
exports.default = async function (context) {
  console.log('bundling things up for electron app');

  console.log('building tailwind.css');
  execSync(`npm run tailwind`, {
    stdio: 'inherit',
  });
};