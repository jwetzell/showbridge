import { has } from 'lodash-es';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

/**
 * @memberof module:Triggers
 * @extends module:Triggers.Trigger
 */
class HTTPRequestTrigger extends Trigger {
  test(msg) {
    let matched = true;

    if (msg.messageType !== 'http') {
      logger.error('trigger: http-request only works with http messages');
      return false;
    }

    if (has(this.params, 'path')) {
      matched = matched && this.params.path === msg.path;
    }

    if (has(this.params, 'method')) {
      matched = matched && this.params.method.toUpperCase() === msg.method.toUpperCase();
    }

    return matched;
  }
}

export default HTTPRequestTrigger;
