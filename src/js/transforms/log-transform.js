const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class LogTransform extends Transform {
  transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (propertyValue !== undefined) {
        if (typeof propertyValue === 'number') {
          const newValue = Math.log(propertyValue) / Math.log(resolvedParams.base);
          _.set(msg, resolvedParams.property, newValue);
        } else {
          logger.error('transform: log can only operate on numbers');
        }
      } else {
        logger.error(`transform: log transform could not find msg property = ${resolvedParams.property}`);
      }
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`tranform: problem executing floor transform - ${error}`);
    }
  }
}

module.exports = LogTransform;
