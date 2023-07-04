const _ = require('lodash');

function resolveTemplatedProperty(params, property, data) {
  if (params[`_${property}`]) {
    const templatedProperty = params[`_${property}`];
    if (Array.isArray(templatedProperty)) {
      console.log('templatedProperty is an array');
      const processedOutput = [];

      templatedProperty.forEach((item) => {
        //only template string types
        if (typeof item === 'string') {
          processedOutput.push(_.template(item)(data));
        } else {
          processedOutput.push(item);
        }
      });
      return processedOutput;
    } else {
      return _.template(templatedProperty)(data);
    }
  } else if (params[property]) {
    return params[property];
  } else {
    return undefined;
  }
}

function hexToBytes(hex) {
  const cleanHex = hex.replaceAll(' ', '').replaceAll('0x', '').replaceAll(',', '');
  const bytes = [];
  for (let c = 0; c < cleanHex.length; c += 2) {
    bytes.push(parseInt(cleanHex.substr(c, 2), 16));
  }
  return bytes;
}

module.exports = {
  resolveTemplatedProperty,
  hexToBytes,
};
