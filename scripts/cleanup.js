const fs = require('fs-extra');

exports.default = async function () {
  console.log('cleaning up after pack');
  const runtimeDir = '../node';
  fs.removeSync(runtimeDir);
};
