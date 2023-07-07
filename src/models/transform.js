const { property } = require('lodash');
const { logger } = require('../utils/helper');
const _ = require('lodash');

class Transform {
  constructor(transformObj) {
    this.type = transformObj.type;
    this.params = transformObj.params;
    this.enabled = transformObj.enabled;
  }

  transform(msg, vars) {
    if (!this.enabled) {
      logger.info(`transform: ${action.type} is disabled skipping...`);

      return;
    }

    logger.info(`transform: before ${this.type} = ${msg}`);
    if (this.params && this.params.hasOwnProperty('property')) {
      const propertyValue = _.get(msg, this.params.property);

      switch (this.type) {
        case 'scale':
          if (propertyValue !== undefined && typeof propertyValue === 'number') {
            const inRange = this.params.inRange;
            const outRange = this.params.outRange;

            const scaledValue =
              ((propertyValue - inRange[0]) * (outRange[1] - outRange[0])) / (inRange[1] - inRange[0]) + outRange[0];
            _.set(msg, this.params.property, scaledValue);
          } else {
            logger.error('transform: scale only works on number values');
          }
          break;
        case 'round':
          if (propertyValue !== undefined) {
            if (typeof propertyValue === 'number') {
              msg[this.params.property] = Math.round(propertyValue);
            } else {
              logger.error('transform: round only works on numbers');
            }
          } else {
            logger.error('transform: transform is configured to look at a property that cannot be found');
          }
          break;
        case 'floor':
          if (propertyValue !== undefined && typeof propertyValue === 'number') {
            _.set(msg, this.params.property, Math.floor(propertyValue));
          } else {
            logger.error('transform: floor only works on numbers');
          }
          break;
        case 'map':
          const map = this.params.map;
          if (map.hasOwnProperty(propertyValue)) {
            _.set(msg, this.params.property, map[propertyValue]);
          }
          break;
        case 'power':
          if (typeof propertyValue === 'number') {
            logger.info(propertyValue);
            const newValue = Math.pow(propertyValue, this.params.power);
            _.set(msg, this.params.property, newValue);
          } else {
            logger.error('transform: power can only operate on numbers');
          }
          break;
        case 'log':
          if (propertyValue !== undefined && typeof propertyValue === 'number') {
            const newValue = Math.log(propertyValue) / Math.log(this.params.base);
            _.set(msg, this.params.property, newValue);
          } else {
            logger.error('transform: log can only operate on numbers');
          }
          break;
        case 'template':
          if (propertyValue !== undefined) {
            let newValue = _.template(this.params.template)({ msg, vars });
            // try to convert it to a number if it is one
            if (parseFloat(newValue) !== NaN) {
              newValue = parseFloat(newValue);
            }
            _.set(msg, this.params.property, newValue);
          }
          break;

        default:
          logger.error(`Transform: unhandled transform type = ${this.type}`);
      }
    } else {
      logger.error('transform: transform does not seem to be configured correctly');
    }
    logger.info(`Transform: after ${this.type} = ${msg}`);
  }
}
module.exports = Transform;
