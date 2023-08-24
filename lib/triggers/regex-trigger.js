import _ from 'lodash-es';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

class RegexTrigger extends Trigger {
  test(msg) {
    if (!_.has(this.params, 'patterns') || !_.has(this.params, 'properties')) {
      logger.error('regex: must have both patterns and properties params');
      return false;
    }

    if (this.params.patterns.length !== this.params.properties.length) {
      logger.error('trigger: regex trigger requires patterns and properties to be the same length');
      return false;
    }

    let allRegexTestsPassed = true;

    // assume the regex will pass
    for (let i = 0; i < this.params.patterns.length; i += 1) {
      const pattern = this.params.patterns[i];
      const property = this.params.properties[i];

      const regex = new RegExp(pattern, 'g');
      const matchPropertyValue = _.get(msg, property);
      if (matchPropertyValue === undefined) {
        logger.error('trigger: regex is configured to look at a property that does not exist on this message.');
        // bad property config = no fire and since all must match we can stop here
        allRegexTestsPassed = false;
      }
      if (!regex.test(matchPropertyValue)) {
        // property value doesn't fit regex = no fire and since all must match we can stop here
        allRegexTestsPassed = false;
      }
    }
    return allRegexTestsPassed;
  }
}

export default RegexTrigger;
