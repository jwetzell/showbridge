const Action = require('./action');
const { logger } = require('../utils/helper');

class LogAction extends Action {
  do(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    logger.info(`log: ${msg.messageType} - ${msg}`);
  }
}
module.exports = LogAction;
