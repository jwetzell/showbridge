const { execSync } = require('child_process');

exports.default = async () => {
  console.log('bundling things up for electron app');

  console.log('building tailwind.css');
  execSync(`npm run tailwind`, {
    stdio: 'inherit',
  });
};
