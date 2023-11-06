const { execSync } = require('child_process');
const { existsSync, removeSync, copySync } = require('fs-extra');
const path = require('path');

exports.default = async function (context) {
  const bundlePathBase = './dist/showbridge';

  if (existsSync(bundlePathBase)) {
    console.log('removing existing bundle');
    removeSync(bundlePathBase);
  }
  console.log('bundling things up for electron app');

  console.log('building tailwind.css');
  execSync(`npm run tailwind`, {
    stdio: 'inherit',
  });

  console.log('bundling showbridge main.js');
  const bundleCommand = [
    'ncc build',
    path.join(__dirname, '../launcher/node_modules/showbridge/main.js'),
    `--out ${path.join(__dirname, bundlePathBase)}`,
    '--minify',
  ].join(' ');

  execSync(bundleCommand, {
    stdio: 'inherit',
  });

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

  const midiPrebuildSourcePath = '../launcher/node_modules/@julusian/midi/prebuilds';
  const midiPrebuildDestPath = path.join(bundlePathBase, 'prebuilds');

  if (!existsSync(path.join(midiPrebuildSourcePath, `midi-${platform}-${arch}`))) {
    console.error(`midi prebuild does not exist for platform ${platform}-${arch}`);
    process.exit(1);
  }
  console.log('copying midi prebuild');

  copySync(
    path.join(midiPrebuildSourcePath, `midi-${platform}-${arch}`),
    path.join(midiPrebuildDestPath, `midi-${platform}-${arch}`)
  );
};
