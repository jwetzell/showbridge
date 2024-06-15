import { Message } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

type LogActionParams = {};

class LogAction extends Action<LogActionParams> {
  _run(_msg: Message, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    logger.info(`log: ${msg.messageType} - ${msg}`);
    this.emit('finished');
  }
}
export default LogAction;
