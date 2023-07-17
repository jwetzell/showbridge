const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class MapTransform extends Transform {
  transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (_.has(resolvedParams.map, propertyValue)) {
        _.set(msg, resolvedParams.property, resolvedParams.map[propertyValue]);
      }
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`tranform: problem executing floor transform - ${error}`);
    }
  }
}

module.exports = MapTransform;
