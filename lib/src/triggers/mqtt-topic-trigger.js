import { has } from 'lodash-es';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

/**
 * @memberof module:Triggers
 * @extends module:Triggers.Trigger
 */
class MQTTTopicTrigger extends Trigger {
  test(msg) {
    if (msg.messageType !== 'mqtt') {
      logger.error('trigger: mqtt-topic only works with mqtt messages');
      return false;
    }

    if (!has(this.params, 'topic')) {
      logger.error('trigger: mqtt-topic has no topic configured');
      return false;
    }

    // NOTE(jwetzell) convert osc wildcard into regex
    const regexString = this.params.topic.replaceAll('+', '[^/]+').replaceAll('#', '.+');
    const topicRegex = new RegExp(`^${regexString}$`);
    return topicRegex.test(msg.topic);
  }
}

export default MQTTTopicTrigger;
