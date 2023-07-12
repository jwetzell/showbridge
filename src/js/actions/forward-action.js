const Action = require('./action');
const { logger } = require('../utils/helper');

class ForwardAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    try {
      const msgToForward = msg.bytes;

      if (msgToForward !== undefined) {
        if (this.params.protocol === 'udp') {
          servers.udp.send(msgToForward, this.params.port, this.params.host);
        } else if (this.params.protocol === 'tcp') {
          servers.tcp.send(msgToForward, this.params.port, this.params.host, msg.messageType === 'osc');
        } else {
          logger.error(`action: unhandled forward protocol = ${this.params.protocol}`);
        }
      } else {
        logger.error('action: this is not a forwardable message type');
      }
    } catch (error) {
      logger.error(`action: error outputting osc - ${error}`);
    }
  }
}
module.exports = ForwardAction;
