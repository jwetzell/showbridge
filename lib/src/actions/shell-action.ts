import { ShellActionParams } from '@showbridge/types';
import { exec } from 'node:child_process';
import { Message } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

class ShellAction extends Action<ShellActionParams> {
  _run(_msg: Message, vars) {
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
