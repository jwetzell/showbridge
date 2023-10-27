import { get, set } from 'lodash-es';
import { logger } from '../utils/index.js';
import Transform from './transform.js';

/**
 * @memberof module:Transforms
 * @extends module:Transforms.Transform
 */
class FloorTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = get(msg, resolvedParams.property);
      if (propertyValue === undefined) {
        logger.error(`transform: floor transform could not find msg property = ${resolvedParams.property}`);
        return;
      }

      if (typeof propertyValue !== 'number') {
        logger.error('transform: floor only works on numbers');
        return;
      }

      set(msg, resolvedParams.property, Math.floor(propertyValue));
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing floor transform - ${error}`);
    }
  }
}

export default FloorTransform;
