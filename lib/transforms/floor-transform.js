const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils');

class FloorTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (propertyValue === undefined) {
        logger.error(`transform: floor transform could not find msg property = ${resolvedParams.property}`);
        return;
      }

      if (typeof propertyValue !== 'number') {
        logger.error('transform: floor only works on numbers');
        return;
      }

      _.set(msg, resolvedParams.property, Math.floor(propertyValue));
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing floor transform - ${error}`);
    }
  }
}

module.exports = FloorTransform;
