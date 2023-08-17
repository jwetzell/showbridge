const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils');

class LogTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (propertyValue === undefined) {
        logger.error(`transform: log transform could not find msg property = ${resolvedParams.property}`);
        return;
      }

      if (typeof propertyValue !== 'number') {
        logger.error('transform: log can only operate on numbers');
        return;
      }

      const newValue = Math.log(propertyValue) / Math.log(resolvedParams.base);
      _.set(msg, resolvedParams.property, newValue);

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing map transform - ${error}`);
    }
  }
}

module.exports = LogTransform;
