const Action = require('./action');
const { logger } = require('../utils');

class LogAction extends Action {
  doFunction(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    logger.info(`log: ${msg.messageType} - ${msg}`);
    this.emit('finished');
  }
}
module.exports = LogAction;
