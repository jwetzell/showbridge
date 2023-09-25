import { set } from 'lodash-es';
import { logger } from '../utils/index.js';
import Action from './action.js';

class StoreAction extends Action {
  doFunction(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      if (resolvedParams.key !== undefined) {
        set(vars, resolvedParams.key, resolvedParams.value);
      } else {
        logger.error('action: store action missing a key');
      }
    } catch (error) {
      logger.error(`action: problem executing store action - ${error}`);
    }
    this.emit('finished');
  }
}
export default StoreAction;
