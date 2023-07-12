const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class PowerTransform extends Transform {
  transform(msg) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    const propertyValue = _.get(msg, this.params.property);
    if (propertyValue !== undefined) {
      if (typeof propertyValue === 'number') {
        const newValue = propertyValue ** this.params.power;
        _.set(msg, this.params.property, newValue);
      } else {
        logger.error('transform: power can only operate on numbers');
      }
    } else {
      logger.error(`transform: power transform could not find msg property = ${this.params.property}`);
    }
    logger.trace(`transform: after ${this.type} = ${msg}`);
  }
}

module.exports = PowerTransform;
