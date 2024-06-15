import { has } from 'lodash-es';
import { OSCMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

type OSCAddressTriggerParams = {
  address: string;
};

class OSCAddressTrigger extends Trigger<OSCAddressTriggerParams> {
  test(msg: OSCMessage) {
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
