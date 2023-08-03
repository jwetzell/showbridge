const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const downloadNode = require('./download_node').default;

exports.default = async function (context) {
  const bundlePathBase = '../dist/bundle';

  if (fs.existsSync(bundlePathBase)) {
    console.log('removing existing bundle');
    fs.removeSync(bundlePathBase);
  }
  console.log('bundling things up for electron app');

  execSync(
    `ncc build ${path.join(__dirname, '../main.js')} -o ${path.join(__dirname, '../dist/bundle')} --target es2020`,
    {
      stdio: 'inherit',
    }
  );
  await downloadNode(context);
  const platform = context.packager.platform.nodeName;

  let arch;
  switch (context.arch) {
    case 1: // x64
      arch = 'x64';
      break;
    case 2:
      arch = 'arm';
      break;
    case 3: // arm64
      arch = 'arm64';
      break;
    default:
      console.error(`Unsupported arch ${context.arch}`);
      process.exit(1);
  }

  const midiPrebuildSourcePath = '../node_modules/@julusian/midi/prebuilds';
  const midiPrebuildDestPath = path.join(bundlePathBase, 'prebuilds');

  if (!fs.existsSync(path.join(midiPrebuildSourcePath, `midi-${platform}-${arch}`))) {
    console.log(`midi prebuild does not exist for platform ${platform}-${arch}`);
    process.exit(1);
  }
  console.log('copying midi prebuild');

  fs.copySync(
    path.join(midiPrebuildSourcePath, `midi-${platform}-${arch}`),
    path.join(midiPrebuildDestPath, `midi-${platform}-${arch}`)
  );
};
