const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class LogTransform extends Transform {
  transform(msg) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    const propertyValue = _.get(msg, this.params.property);
    if (propertyValue !== undefined) {
      if (typeof propertyValue === 'number') {
        const newValue = Math.log(propertyValue) / Math.log(this.params.base);
        _.set(msg, this.params.property, newValue);
      } else {
        logger.error('transform: log can only operate on numbers');
      }
    } else {
      logger.error(`transform: log transform could not find msg property = ${this.params.property}`);
    }
    logger.trace(`transform: after ${this.type} = ${msg}`);
  }
}

module.exports = LogTransform;
