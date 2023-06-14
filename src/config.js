const Ajv = require('ajv');
const ajv = new Ajv();
const configSchema = require('./schema/config.schema.json');
const { readFileSync } = require('fs');

let config = {
  osc: {
    tcp: {
      port: 8000,
    },
    udp: {
      port: 8000,
    },
    triggers: [
      {
        type: 'host',
        params: {
          host: '127.0.0.1',
        },
        actions: [
          {
            type: 'log',
            enabled: true,
          },
          {
            type: 'osc-forward',
            params: {
              host: 'localhost',
              port: 8001,
              protocol: 'udp',
            },
            enabled: true,
          },
        ],
        enabled: true,
      },
    ],
  },
  midi: {
    triggers: [],
  },
};

function load(filename) {
  try {
  } catch (error) {
    console.log(`problem loading config from ${filename}`);
    console.error(error);
  }
  const configToLoad = JSON.parse(readFileSync(filename));
  const configCheck = ajv.validate(configSchema, configToLoad);
  if (!configCheck) {
    console.log(`config ${filename} is not valid so will not be loaded, old config is still active`);
    return false;
  } else {
    console.log(`config ${filename} is valid and loaded`);
    config = configToLoad;
    return true;
  }
}
function get() {
  return config;
}

//this is to ensure the default config is valid
const defaultConfigCheck = ajv.validate(configSchema, config);
if (!defaultConfigCheck) {
  console.log(`default config is bad this shouldn't happen`);
  console.log(ajv.errors);
  process.exit(1);
}

module.exports = {
  load,
  get,
};
