const Action = require('./action');
const { logger, hexToBytes } = require('../utils/helper');

class UDPOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    let udpSend;
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.bytes !== undefined) {
        udpSend = resolvedParams.bytes;
      } else if (resolvedParams.hex !== undefined) {
        udpSend = hexToBytes(resolvedParams.hex);
      } else if (resolvedParams.string !== undefined) {
        // check for string or _string
        udpSend = resolvedParams.string;
      }

      if (udpSend !== undefined) {
        servers.udp.send(Buffer.from(udpSend), this.params.port, this.params.host);
      } else {
        logger.error('action: udp-output has nothing to send');
      }
    } catch (error) {
      logger.error(`action: problem executing tcp-output action - ${error}`);
    }
  }
}
module.exports = UDPOutputAction;
