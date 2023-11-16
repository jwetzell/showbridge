import { exec } from 'child_process';
import { logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class ShellAction extends Action {
  doFunction(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.command !== undefined && resolvedParams.command !== '') {
        exec(resolvedParams.command, (error, stdout) => {
          if (error) {
            logger.error(`action: problem executing shell action - ${error}`);
            return;
          }
          logger.debug(`shell: ${stdout}`);
        });
      }
    } catch (error) {
      logger.error(`action: problem executing shell action - ${error}`);
    }
    this.emit('finished');
  }
}
export default ShellAction;
