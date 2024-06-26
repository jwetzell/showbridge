import { ScaleTransformParams } from '@showbridge/types';
import { get, has, set } from 'lodash-es';
import { Message } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Transform from './transform.js';

class ScaleTransform extends Transform<ScaleTransformParams> {
  _transform(msg: Message, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const propertyValue = get(msg, resolvedParams.property);
      if (propertyValue === undefined) {
        logger.error(`transform: scale transform could not find msg property = ${resolvedParams.property}`);
        return;
      }

      if (typeof propertyValue !== 'number') {
        logger.error('transform: scale only works on number values');
        return;
      }

      if (!has(resolvedParams, 'inRange') || !has(resolvedParams, 'outRange')) {
        logger.error('transform: scale must have both an inRange and an outRange property');
        return;
      }

      const { inRange, outRange } = resolvedParams;

      const scaledValue =
        ((propertyValue - inRange[0]) * (outRange[1] - outRange[0])) / (inRange[1] - inRange[0]) + outRange[0];
      set(msg, resolvedParams.property, scaledValue);

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing scale transform - ${error}`);
    }
  }
}

export default ScaleTransform;
