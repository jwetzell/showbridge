const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

exports.default = async function (context) {
  const cacheDir = '../.cache/node';
  await fs.mkdirpSync(cacheDir);

  const runtimeDir = '../node';
  await fs.mkdirpSync(runtimeDir);

  const nodeVersion = fs.readFileSync('../.nvmrc').toString().trim();
  let fileName = `node-${nodeVersion}`;
  let arch;
  let extension;

  const platform = context.packager.platform.nodeName === 'win32' ? 'win' : context.packager.platform.nodeName;
  fileName += `-${platform}`;

  switch (context.arch) {
    case 1: // x64
      arch = 'x64';
      break;
    case 2:
      arch = 'armv7l';
      break;
    case 3: // arm64
      arch = 'arm64';
      break;
    default:
      console.error(`Unsupported arch ${context.arch}`);
      process.exit(1);
  }

  if (platform === 'win') {
    extension = 'zip';
  } else {
    extension = 'tar.gz';
  }
  fileName += `-${arch}`;

  const nodeReleaseBundle = path.join(cacheDir, `${fileName}.${extension}`);
  console.log(`looking for ${nodeReleaseBundle}`);

  if (!fs.existsSync(nodeReleaseBundle)) {
    const nodeUrl = `https://nodejs.org/download/release/${nodeVersion}/${fileName}.${extension}`;

    console.log(`downloading node: ${nodeUrl}`);

    const response = await fetch(nodeUrl);
    if (!response.ok) {
      console.error(`unexpected response ${response.statusText}`);
      process.exit(1);
    }
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(nodeReleaseBundle, Buffer.from(arrayBuffer));
  }

  const itemsToRemove = ['share', 'include'];

  if (platform === 'win') {
    const extractDir = path.join(cacheDir, fileName);

    if (fs.existsSync(extractDir)) {
      console.log('removing old extracted runtime');
      fs.removeSync(extractDir);
    }
    console.log(`extracting node ${nodeReleaseBundle}`);

    execSync(`unzip ${nodeReleaseBundle} -d ${cacheDir}`);
    fs.moveSync(extractDir, runtimeDir, { overwrite: true });
    itemsToRemove.push('node_modules/npm', 'npm', 'npx');
  } else {
    if (fs.existsSync(runtimeDir)) {
      console.log('removing old runtime');
      fs.removeSync(runtimeDir);
    }
    console.log(`extracting node ${nodeReleaseBundle}`);

    fs.mkdirpSync(runtimeDir);
    execSync(`tar xzf ${nodeReleaseBundle} --strip-components=1 -C ${runtimeDir}`);
    itemsToRemove.push('lib/node_modules/npm', 'bin/npm', 'bin/npx');
  }

  console.log('cleaning out unused node stuff');
  itemsToRemove.forEach((item) => {
    fs.removeSync(path.join(runtimeDir, item));
  });
};
