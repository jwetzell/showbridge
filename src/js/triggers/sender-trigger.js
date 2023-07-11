const _ = require('lodash');
const Trigger = require('./trigger');
const { logger } = require('../utils/helper');

class SenderTrigger extends Trigger {
  shouldFire(msg) {
    if (_.has(msg, 'sender')) {
      if (msg.sender.address === this.params.address) {
        return true;
      }
      return false;
    }
    logger.error('trigger: host trigger attempted on message type that does not have host information');
    return false;
  }
}

module.exports = SenderTrigger;
