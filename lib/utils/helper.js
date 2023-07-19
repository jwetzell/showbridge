const _ = require('lodash');
const pino = require('pino');
const pretty = require('pino-pretty');

function resolveTemplatedProperty(params, property, data) {
  if (_.has(params, `_${property}`)) {
    // if we have a template versin of the property
    const templatedProperty = params[`_${property}`];

    // process arrays items one by one
    if (Array.isArray(templatedProperty)) {
      const processedOutput = [];
      templatedProperty.forEach((item) => {
        // only template string types
        if (typeof item === 'string') {
          let templateResult = _.template(item)(data);
          if (!Number.isNaN(parseFloat(templateResult))) {
            templateResult = parseFloat(templateResult);
          }
          processedOutput.push(templateResult);
        } else {
          processedOutput.push(item);
        }
      });
      return processedOutput;
    }
    if (typeof templatedProperty === 'string') {
      return _.template(templatedProperty)(data);
    }
    return templatedProperty;
  }
  if (_.has(params, property)) {
    return params[property];
  }
  return undefined;
}

function resolveAllKeys(_obj, data) {
  const obj = _.cloneDeep(_obj);
  Object.keys(obj)
    .filter((key) => key.startsWith('_'))
    .forEach((templateKey) => {
      // NOTE(jwetzell): essentially replace _key: "${msg.property}" with key: "resolvedValue"
      const cleanKey = templateKey.replace('_', '');
      _.set(obj, cleanKey, resolveTemplatedProperty(obj, cleanKey, data));
      delete obj[templateKey];
    });
  return obj;
}

function hexToBytes(hex) {
  const cleanHex = hex.replaceAll(' ', '').replaceAll('0x', '').replaceAll(',', '');
  const bytes = [];
  for (let c = 0; c < cleanHex.length; c += 2) {
    bytes.push(parseInt(cleanHex.substr(c, 2), 16));
  }
  return bytes;
}

// TODO(jwetzell): sort out logging
const logger = pino(pretty());

module.exports = {
  resolveAllKeys,
  resolveTemplatedProperty,
  hexToBytes,
  logger,
};
