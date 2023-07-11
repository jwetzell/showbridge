const _ = require('lodash');
const Trigger = require('./trigger');
const { logger } = require('../utils/helper');

class RegexTrigger extends Trigger {
  shouldFire(msg) {
    let fire = false;
    if (this.params) {
      if (!!this.params.patterns && !!this.params.properties) {
        if (this.params.patterns.length === this.params.properties.length) {
          // assume the regex will pass
          fire = true;
          for (let i = 0; i < this.params.patterns.length; i += 1) {
            const pattern = this.params.patterns[i];
            const property = this.params.properties[i];

            const regex = new RegExp(pattern, 'g');
            const matchPropertyValue = _.get(msg, property);
            if (matchPropertyValue === undefined) {
              logger.error('trigger: regex is configured to look at a property that does not exist on this message.');
              // bad property config = no fire and since all must match we can stop here
              fire = false;
            }
            if (!regex.test(matchPropertyValue)) {
              // property value doesn't fit regex = no fire and since all must match we can stop here
              fire = false;
            }
          }
        } else {
          logger.error('trigger: regex trigger requires a 1:1 between patterns and properties');
        }
      }
    }
    return fire;
  }
}

module.exports = RegexTrigger;
