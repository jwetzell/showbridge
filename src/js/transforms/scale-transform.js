const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class ScaleTransform extends Transform {
  transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    const propertyValue = _.get(msg, this.params.property);
    if (propertyValue !== undefined) {
      if (typeof propertyValue === 'number') {
        const { inRange } = this.params;
        const { outRange } = this.params;

        const scaledValue =
          ((propertyValue - inRange[0]) * (outRange[1] - outRange[0])) / (inRange[1] - inRange[0]) + outRange[0];
        _.set(msg, this.params.property, scaledValue);
      } else {
        logger.error('transform: scale only works on number values');
      }
    } else {
      logger.error(`transform: scale transform could not find msg property = ${this.params.property}`);
    }
    logger.trace(`transform: after ${this.type} = ${msg}`);
  }
}

module.exports = ScaleTransform;
