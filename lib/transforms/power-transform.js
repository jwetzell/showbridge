const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils');

class PowerTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (propertyValue === undefined) {
        logger.error(`transform: power transform could not find msg property = ${resolvedParams.property}`);
        return;
      }

      if (typeof propertyValue !== 'number') {
        logger.error('transform: power can only operate on numbers');
        return;
      }

      const newValue = propertyValue ** resolvedParams.power;
      _.set(msg, resolvedParams.property, newValue);

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing power transform - ${error}`);
    }
  }
}

module.exports = PowerTransform;
