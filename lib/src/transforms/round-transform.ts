import { RoundTransformParams } from '@showbridge/types';
import { get, set } from 'lodash-es';
import { Message } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Transform from './transform.js';

class RoundTransform extends Transform<RoundTransformParams> {
  _transform(msg: Message, vars) {
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
