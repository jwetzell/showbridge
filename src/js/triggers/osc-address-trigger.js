const Trigger = require('./trigger');
const { logger } = require('../utils/helper');

class OSCAddressTrigger extends Trigger {
  shouldFire(msg) {
    if (msg.messageType === 'osc') {
      if (!!this.params && this.params.address !== undefined) {
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
      return false;
    }
    logger.error('trigger: osc-address only works with osc messages');
    return false;
  }
}

module.exports = OSCAddressTrigger;
