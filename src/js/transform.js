/* eslint-disable no-param-reassign */
const _ = require('lodash');
const { logger } = require('./utils/helper');

class Transform {
  constructor(transformObj) {
    this.type = transformObj.type;
    this.params = transformObj.params;
    this.enabled = transformObj.enabled;
  }

  transform(msg, vars) {
    if (!this.enabled) {
      logger.debug(`transform: ${this.type} is disabled skipping...`);
      return;
    }

    logger.trace(`transform: before ${this.type} = ${msg}`);
    if (this.params && _.has(this.params, 'property')) {
      const propertyValue = _.get(msg, this.params.property);

      switch (this.type) {
        case 'scale':
          if (propertyValue !== undefined) {
            if (typeof propertyValue === 'number') {
              const { inRange } = this.params;
              const { outRange } = this.params;

              const scaledValue =
                ((propertyValue - inRange[0]) * (outRange[1] - outRange[0])) / (inRange[1] - inRange[0]) + outRange[0];
              _.set(msg, this.params.property, scaledValue);
            } else {
              logger.error('transform: scale only works on number values');
            }
          } else {
            logger.error(`transform: scale transform could not find msg property = ${this.params.property}`);
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
            logger.error(`transform: round transform could not find msg property = ${this.params.property}`);
          }
          break;
        case 'floor':
          if (propertyValue !== undefined) {
            if (typeof propertyValue === 'number') {
              _.set(msg, this.params.property, Math.floor(propertyValue));
            } else {
              logger.error('transform: floor only works on numbers');
            }
          } else {
            logger.error(`transform: floor transform could not find msg property = ${this.params.property}`);
          }
          break;
        case 'map':
          if (_.has(this.params.map, propertyValue)) {
            _.set(msg, this.params.property, this.params.map[propertyValue]);
          }
          break;
        case 'power':
          if (propertyValue !== undefined) {
            if (typeof propertyValue === 'number') {
              const newValue = propertyValue ** this.params.power;
              _.set(msg, this.params.property, newValue);
            } else {
              logger.error('transform: power can only operate on numbers');
            }
          } else {
            logger.error(`transform: power transform could not find msg property = ${this.params.property}`);
          }
          break;
        case 'log':
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
          break;
        case 'template':
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
          break;

        default:
          logger.error(`transform: unhandled transform type = ${this.type}`);
      }
    } else {
      logger.error('transform: transform does not seem to be configured correctly');
    }
    logger.trace(`transform: after ${this.type} = ${msg}`);
  }
}
module.exports = Transform;
