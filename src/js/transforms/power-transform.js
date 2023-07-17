const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class PowerTransform extends Transform {
  transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (propertyValue !== undefined) {
        if (typeof propertyValue === 'number') {
          const newValue = propertyValue ** resolvedParams.power;
          _.set(msg, resolvedParams.property, newValue);
        } else {
          logger.error('transform: power can only operate on numbers');
        }
      } else {
        logger.error(`transform: power transform could not find msg property = ${resolvedParams.property}`);
      }

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`tranform: problem executing floor transform - ${error}`);
    }
  }
}

module.exports = PowerTransform;
