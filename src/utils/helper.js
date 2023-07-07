const _ = require('lodash');
function resolveTemplatedProperty(params, property, data) {
  if (params.hasOwnProperty(`_${property}`)) {
    //if we have a template versin of the property
    const templatedProperty = params[`_${property}`];

    // process arrays items one by one
    if (Array.isArray(templatedProperty)) {
      const processedOutput = [];
      templatedProperty.forEach((item) => {
        //only template string types
        if (typeof item === 'string') {
          let templateResult = _.template(item)(data);
          if (parseFloat(templateResult)) {
            templateResult = parseFloat(templateResult);
          }
          processedOutput.push(templateResult);
        } else {
          processedOutput.push(item);
        }
      });
      return processedOutput;
    } else if (typeof templatedProperty === 'string') {
      return _.template(templatedProperty)(data);
    } else {
      return templatedProperty;
    }
  } else if (params.hasOwnProperty(property)) {
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

const pino = require('pino');
const transport = pino.transport({
  target: 'pino-pretty',
  options: { destination: 1 },
});
const logger = pino(transport);

module.exports = {
  resolveTemplatedProperty,
  hexToBytes,
  logger,
};
