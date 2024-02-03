export function hexToBytes(hex) {
  const cleanHex = hex.replaceAll(' ', '').replaceAll('0x', '').replaceAll(',', '');
  const bytes = [];
  for (let c = 0; c < cleanHex.length; c += 2) {
    bytes.push(parseInt(cleanHex.substr(c, 2), 16));
  }
  return bytes;
}

export const disabled = {
  actions: new Set(),
  protocols: new Set(),
  triggers: new Set(),
  transforms: new Set(),
};

export { default as logger } from './logging.js';
export * as Templating from './templating.js';
export * as Types from './types.js';
