const fs = require('fs-extra');

exports.default = async function (context) {
  console.log('cleaning up after pack');
  const runtimeDir = '../node';
  fs.removeSync(runtimeDir);
  fs.removeSync('../dist/bundle');
};
