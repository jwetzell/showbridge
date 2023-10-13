import { set, template } from 'lodash-es';
import { logger } from '../utils/index.js';
import Transform from './transform.js';

class TemplateTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      let newValue = template(resolvedParams.template)({ msg, vars });
      // NOTE(jwetzell): try to convert it to a number if it is one
      if (!Number.isNaN(parseFloat(newValue))) {
        newValue = parseFloat(newValue);
      }
      set(msg, resolvedParams.property, newValue);

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing template transform - ${error}`);
    }
  }
}

export default TemplateTransform;
