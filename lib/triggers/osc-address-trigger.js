const { has } = require('lodash');
const Trigger = require('./trigger');
const { logger } = require('../utils');

class OSCAddressTrigger extends Trigger {
  shouldFire(msg) {
    if (msg.messageType !== 'osc') {
      logger.error('trigger: osc-address only works with osc messages');
      return false;
    }

    if (!has(this.params, 'address')) {
      logger.error('trigger: osc-address has no address configured');
      return false;
    }

    // NOTE(jwetzell) convert osc wildcard into regex
    const regexString = this.params.address
      .replaceAll('{', '(')
      .replaceAll('}', ')')
      .replaceAll(',', '|')
      .replaceAll('[!', '[^')
      .replaceAll('*', '[^/]+')
      .replaceAll('?', '.');
    const addressRegex = new RegExp(`^${regexString}$`);
    return addressRegex.test(msg.address);
  }
}

module.exports = OSCAddressTrigger;
