import { get, has, set } from 'lodash-es';
import { logger } from '../utils/index.js';
import Transform from './transform.js';

/**
 * @memberof module:Transforms
 * @extends module:Transforms.Transform
 */
class MapTransform extends Transform {
  _transform(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = get(msg, resolvedParams.property);
      if (has(resolvedParams.map, propertyValue)) {
        set(msg, resolvedParams.property, resolvedParams.map[propertyValue]);
      }
      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing map transform - ${error}`);
    }
  }
}

export default MapTransform;
