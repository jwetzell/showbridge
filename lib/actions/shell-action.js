import { exec } from 'child_process';
import Action from './action.js';
import { logger } from '../utils/index.js';

class ShellAction extends Action {
  doFunction(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.command !== undefined && resolvedParams.command !== '') {
        exec(resolvedParams.command);
      }
    } catch (error) {
      logger.error(`action: problem executing shell action - ${error}`);
    }
    this.emit('finished');
  }
}
export default ShellAction;
