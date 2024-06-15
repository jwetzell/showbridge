import { set } from 'lodash-es';
import { Message } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

class StoreAction extends Action {
  _run(_msg: Message, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      if (resolvedParams.key !== undefined) {
        set(vars, resolvedParams.key, resolvedParams.value);
        console.log(resolvedParams);
        console.log(vars);
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
