const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class ScaleTransform extends Transform {
  transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (propertyValue !== undefined) {
        if (typeof propertyValue === 'number') {
          const { inRange, outRange } = resolvedParams;

          const scaledValue =
            ((propertyValue - inRange[0]) * (outRange[1] - outRange[0])) / (inRange[1] - inRange[0]) + outRange[0];
          _.set(msg, resolvedParams.property, scaledValue);
        } else {
          logger.error('transform: scale only works on number values');
        }
      } else {
        logger.error(`transform: scale transform could not find msg property = ${resolvedParams.property}`);
      }
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`tranform: problem executing floor transform - ${error}`);
    }
  }
}

module.exports = ScaleTransform;
