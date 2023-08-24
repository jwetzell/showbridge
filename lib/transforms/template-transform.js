import _ from 'lodash-es';
import Transform from './transform.js';
import { logger } from '../utils/index.js';

class TemplateTransform extends Transform {
  transformFunction(msg, vars) {
    logger.trace(`transform: before ${this.type} = ${msg}`);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      let newValue = _.template(resolvedParams.template)({ msg, vars });
      // try to convert it to a number if it is one
      if (!Number.isNaN(parseFloat(newValue))) {
        newValue = parseFloat(newValue);
      }
      _.set(msg, resolvedParams.property, newValue);

      logger.trace(`transform: after ${this.type} = ${msg}`);
    } catch (error) {
      logger.error(`transform: problem executing template transform - ${error}`);
    }
  }
}

export default TemplateTransform;
