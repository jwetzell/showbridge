const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class RoundTransform extends Transform {
  transform(msg) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    const propertyValue = _.get(msg, this.params.property);
    if (propertyValue !== undefined) {
      if (typeof propertyValue === 'number') {
        _.set(msg, this.params.property, Math.round(propertyValue));
      } else {
        logger.error('transform: round only works on numbers');
      }
    } else {
      logger.error(`transform: round transform could not find msg property = ${this.params.property}`);
    }
    logger.trace(`transform: after ${this.type} = ${msg}`);
  }
}

module.exports = RoundTransform;
