import { get, set } from 'lodash-es';
import { logger } from '../utils/index.js';
import Transform from './transform.js';

/**
 * @memberof module:Transforms
 * @extends module:Transforms.Transform
 */
class PowerTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = get(msg, resolvedParams.property);
      if (propertyValue === undefined) {
        logger.error(`transform: power transform could not find msg property = ${resolvedParams.property}`);
        return;
      }

      if (typeof propertyValue !== 'number') {
        logger.error('transform: power can only operate on numbers');
        return;
      }

      const newValue = propertyValue ** resolvedParams.power;
      set(msg, resolvedParams.property, newValue);

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing power transform - ${error}`);
    }
  }
}

export default PowerTransform;
