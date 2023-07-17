const Action = require('./action');
const { logger, hexToBytes } = require('../utils/helper');

class TCPOutputAction extends Action {
  do(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    let tcpSend;
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.bytes !== undefined) {
        tcpSend = resolvedParams.bytes;
      } else if (resolvedParams.hex !== undefined) {
        tcpSend = hexToBytes(resolvedParams.hex);
      } else if (resolvedParams.string !== undefined) {
        // check for string or _string
        tcpSend = resolvedParams.string;
      }

      if (tcpSend !== undefined) {
        protocols.tcp.send(Buffer.from(tcpSend), resolvedParams.port, resolvedParams.host, resolvedParams.slip);
      } else {
        logger.error('action: tcp-output has nothing to send');
      }
    } catch (error) {
      logger.error(`action: problem executing tcp-output action - ${error}`);
    }
  }
}
module.exports = TCPOutputAction;
