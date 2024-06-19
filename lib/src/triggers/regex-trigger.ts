import { RegexTriggerParams } from '@showbridge/types';
import { get, has } from 'lodash-es';
import { Message } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

class RegexTrigger extends Trigger<RegexTriggerParams> {
  test(msg: Message) {
    if (!has(this.params, 'patterns') || !has(this.params, 'properties')) {
      logger.error('regex: must have both patterns and properties params');
      return false;
    }

    if (this.params.patterns.length !== this.params.properties.length) {
      logger.error('trigger: regex trigger requires patterns and properties to be the same length');
      return false;
    }

    let allRegexTestsPassed = true;

    for (let i = 0; i < this.params.patterns.length; i += 1) {
      const pattern = this.params.patterns[i];
      const property = this.params.properties[i];

      const regex = new RegExp(pattern, 'g');
      const matchPropertyValue = get(msg, property);
      if (matchPropertyValue === undefined) {
        logger.error('trigger: regex is configured to look at a property that does not exist on this message.');
        // NOTE(jwetzell): bad property config = no fire and since all must match we can stop here
        allRegexTestsPassed = false;
      }
      if (!regex.test(matchPropertyValue)) {
        // NOTE(jwetzell): property value doesn't fit regex = no fire and since all must match we can stop here
        allRegexTestsPassed = false;
      }
    }
    return allRegexTestsPassed;
  }
}

export default RegexTrigger;
