const _ = require('lodash');
const Trigger = require('./trigger');
const { logger } = require('../utils/helper');

class BytesEqualTrigger extends Trigger {
  shouldFire(msg) {
    if (msg.bytes !== undefined) {
      // good we are looking at a message that has bytes
      const bytesToMatch = Uint8Array.from(this.params.bytes);
      if (_.isEqual(msg.bytes, bytesToMatch)) {
        return true;
      }
      return false;
    }
    logger.error('trigger: bytes equality check attempted on msg that does not have bytes');
    return false;
  }
}

module.exports = BytesEqualTrigger;
