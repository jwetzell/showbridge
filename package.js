const { exec } = require('pkg');
const packageInfo = require('./package.json');
const os = require('os');
let output = `dist/bin/${packageInfo.name}`;
const version = `.v${packageInfo.version}`;

switch (os.type()) {
  case 'Darwin':
    output += `.mac${version}`;
    break;
  case 'Linux':
    output += `.linux${version}`;
    break;
  case 'Windows_NT':
    output += `.win${version}.exe`;
    break;
  default:
    console.error('unknown os type');
    process.exit(1);
}

exec(['dist/index.min.js', '--target', 'host', '--output', output, '-c', 'package.json', '-C', 'GZip']);
