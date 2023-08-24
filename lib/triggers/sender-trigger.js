import _ from 'lodash-es';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

class SenderTrigger extends Trigger {
  test(msg) {
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

export default SenderTrigger;
