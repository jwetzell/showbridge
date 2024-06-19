import { PowerTransformParams } from '@showbridge/types';
import { get, set } from 'lodash-es';
import { Message } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Transform from './transform.js';

class PowerTransform extends Transform<PowerTransformParams> {
  _transform(msg: Message, vars) {
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

      const newValue = propertyValue ** resolvedParams.exponent;
      set(msg, resolvedParams.property, newValue);

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing power transform - ${error}`);
    }
  }
}

export default PowerTransform;
