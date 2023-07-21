const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils');

class RoundTransform extends Transform {
  transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (propertyValue === undefined) {
        logger.error(`transform: round transform could not find msg property = ${resolvedParams.property}`);
        return;
      }
      if (typeof propertyValue !== 'number') {
        logger.error('transform: round only works on numbers');
        return;
      }

      _.set(msg, resolvedParams.property, Math.round(propertyValue));
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing round transform - ${error}`);
    }
  }
}

module.exports = RoundTransform;
