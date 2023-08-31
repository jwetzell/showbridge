import { get, set } from 'lodash-es';
import { logger } from '../utils/index.js';
import Transform from './transform.js';

class LogTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = get(msg, resolvedParams.property);
      if (propertyValue === undefined) {
        logger.error(`transform: log transform could not find msg property = ${resolvedParams.property}`);
        return;
      }

      if (typeof propertyValue !== 'number') {
        logger.error('transform: log can only operate on numbers');
        return;
      }

      const newValue = Math.log(propertyValue) / Math.log(resolvedParams.base);
      set(msg, resolvedParams.property, newValue);

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing map transform - ${error}`);
    }
  }
}

export default LogTransform;
