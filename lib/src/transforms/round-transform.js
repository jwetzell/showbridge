import { get, set } from 'lodash-es';
import { logger } from '../utils/index.js';
import Transform from './transform.js';

/**
 * @memberof module:Transforms
 * @extends module:Transforms.Transform
 */
class RoundTransform extends Transform {
  _transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = get(msg, resolvedParams.property);
      if (propertyValue === undefined) {
        logger.error(`transform: round transform could not find msg property = ${resolvedParams.property}`);
        return;
      }
      if (typeof propertyValue !== 'number') {
        logger.error('transform: round only works on numbers');
        return;
      }

      set(msg, resolvedParams.property, Math.round(propertyValue));
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing round transform - ${error}`);
    }
  }
}

export default RoundTransform;
