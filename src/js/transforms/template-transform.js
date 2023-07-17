const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class TemplateTransform extends Transform {
  transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (propertyValue !== undefined) {
        try {
          let newValue = _.template(resolvedParams.template)({ msg, vars });
          // try to convert it to a number if it is one
          if (!Number.isNaN(parseFloat(newValue))) {
            newValue = parseFloat(newValue);
          }
          _.set(msg, resolvedParams.property, newValue);
        } catch (error) {
          logger.error(`transform: problem templating property - ${error}`);
          throw error;
        }
      }
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`tranform: problem executing floor transform - ${error}`);
    }
  }
}

module.exports = TemplateTransform;
