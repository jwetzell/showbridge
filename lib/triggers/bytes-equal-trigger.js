const _ = require('lodash');
const Trigger = require('./trigger');
const { logger } = require('../utils');

class BytesEqualTrigger extends Trigger {
  shouldFire(msg) {
    if (msg.bytes === undefined) {
      logger.error('trigger: bytes equality check attempted on msg that does not have bytes');
      return false;
    }

    // NOTE(jwetzell): good we are looking at a message that has bytes
    const bytesToMatch = Uint8Array.from(this.params.bytes);
    return _.isEqual(msg.bytes, bytesToMatch);
  }
}

module.exports = BytesEqualTrigger;
