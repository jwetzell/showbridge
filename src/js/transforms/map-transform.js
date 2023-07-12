const _ = require('lodash');
const Transform = require('./transform');
const { logger } = require('../utils/helper');

class MapTransform extends Transform {
  transform(msg) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    const propertyValue = _.get(msg, this.params.property);
    if (_.has(this.params.map, propertyValue)) {
      _.set(msg, this.params.property, this.params.map[propertyValue]);
    }
    logger.trace(`transform: after ${this.type} = ${msg}`);
  }
}

module.exports = MapTransform;
