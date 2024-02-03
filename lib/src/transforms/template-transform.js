import { set } from 'lodash-es';
import { Templating, logger } from '../utils/index.js';
import Transform from './transform.js';

/**
 * @memberof module:Transforms
 * @extends module:Transforms.Transform
 */
class TemplateTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      let newValue = Templating.getTemplateResult(resolvedParams.template, { msg, vars });
      // NOTE(jwetzell): try to convert it to a number if it is one
      if (!Number.isNaN(parseFloat(newValue))) {
        newValue = parseFloat(newValue);
      }
      set(msg, resolvedParams.property, newValue);

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing template transform - ${error}`);
      logger.error(error);
    }
  }
}

export default TemplateTransform;
