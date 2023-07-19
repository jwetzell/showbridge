const _ = require('lodash');
const Trigger = require('./trigger');
const { logger } = require('../utils/helper');

class SenderTrigger extends Trigger {
  shouldFire(msg) {
    if (!_.has(msg, 'sender')) {
      logger.error('trigger: host trigger attempted on message type that does not have host information');
      return false;
    }

    if (_.has(this.params, 'address')) {
      return msg.sender.address === this.params.address;
    }

    // NOTE(jwetzell): default to a no match
    return false;
  }
}

module.exports = SenderTrigger;
