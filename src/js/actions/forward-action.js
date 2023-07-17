const Action = require('./action');
const { logger } = require('../utils/helper');

class ForwardAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    try {
      const msgToForward = msg.bytes;

      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (msgToForward !== undefined) {
        if (resolvedParams.protocol === 'udp') {
          servers.udp.send(msgToForward, resolvedParams.port, resolvedParams.host);
        } else if (resolvedParams.protocol === 'tcp') {
          servers.tcp.send(msgToForward, resolvedParams.port, resolvedParams.host, msg.messageType === 'osc');
        } else {
          logger.error(`action: unhandled forward protocol = ${resolvedParams.protocol}`);
        }
      } else {
        logger.error('action: this is not a forwardable message type');
      }
    } catch (error) {
      logger.error(`action: problem executing forward action - ${error}`);
    }
  }
}
module.exports = ForwardAction;
