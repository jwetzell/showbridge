import { TemplateTransformParams } from '@showbridge/types';
import { set } from 'lodash-es';
import { Message } from '../messages/index.js';
import { Templating, logger } from '../utils/index.js';
import Transform from './transform.js';

class TemplateTransform extends Transform<TemplateTransformParams> {
  _transform(msg: Message, vars) {
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      let newValue: string = Templating.getTemplateResult(resolvedParams.template, { msg, vars });
      // NOTE(jwetzell): try to convert it to a number if it is one
      if (!Number.isNaN(parseFloat(newValue))) {
        if (newValue.includes('.')) {
          set(msg, resolvedParams.property, parseFloat(newValue));
        } else {
          set(msg, resolvedParams.property, parseInt(newValue));
        }
      } else {
        set(msg, resolvedParams.property, newValue);
      }

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing template transform - ${error}`);
      logger.error(error);
    }
  }
}

export default TemplateTransform;
