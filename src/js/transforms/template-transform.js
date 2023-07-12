const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class TemplateTransform extends Transform {
  transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    const propertyValue = _.get(msg, this.params.property);
    if (propertyValue !== undefined) {
      try {
        let newValue = _.template(this.params.template)({ msg, vars });
        // try to convert it to a number if it is one
        if (Number.isNaN(parseFloat(newValue))) {
          newValue = parseFloat(newValue);
        }
        _.set(msg, this.params.property, newValue);
      } catch (error) {
        logger.error(`transform: problem templating property - ${error}`);
        throw error;
      }
    }
    logger.trace(`transform: after ${this.type} = ${msg}`);
  }
}

module.exports = TemplateTransform;
