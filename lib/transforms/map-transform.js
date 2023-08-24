import _ from 'lodash-es';
import Transform from './transform.js';
import { logger } from '../utils/index.js';

class MapTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = _.get(msg, resolvedParams.property);
      if (_.has(resolvedParams.map, propertyValue)) {
        _.set(msg, resolvedParams.property, resolvedParams.map[propertyValue]);
      }
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing map transform - ${error}`);
    }
  }
}

export default MapTransform;
