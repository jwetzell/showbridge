import { has } from 'lodash-es';
import Trigger from './trigger.js';
import { logger } from '../utils/index.js';

class OSCAddressTrigger extends Trigger {
  test(msg) {
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

export default OSCAddressTrigger;
