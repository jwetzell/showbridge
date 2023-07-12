const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class FloorTransform extends Transform {
  transform(msg) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    const propertyValue = _.get(msg, this.params.property);
    if (propertyValue !== undefined) {
      if (typeof propertyValue === 'number') {
        _.set(msg, this.params.property, Math.floor(propertyValue));
      } else {
        logger.error('transform: floor only works on numbers');
      }
    } else {
      logger.error(`transform: floor transform could not find msg property = ${this.params.property}`);
    }
    logger.trace(`transform: after ${this.type} = ${msg}`);
  }
}

module.exports = FloorTransform;
