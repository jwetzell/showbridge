import { logger } from '../utils/index.js';
import Action from './action.js';

class LogAction extends Action {
  doFunction(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    logger.info(`log: ${msg.messageType} - ${msg}`);
    this.emit('finished');
  }
}
export default LogAction;
