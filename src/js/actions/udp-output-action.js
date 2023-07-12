const Action = require('./action');
const { logger, hexToBytes, resolveTemplatedProperty } = require('../utils/helper');

class UDPOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    let udpSend;

    if (this.params.bytes !== undefined) {
      udpSend = this.params.bytes;
    } else if (this.params.hex !== undefined) {
      udpSend = hexToBytes(this.params.hex);
    } else {
      // check for string or _string
      udpSend = resolveTemplatedProperty(this.params, 'string', { msg, vars });
    }

    if (udpSend !== undefined) {
      servers.udp.send(Buffer.from(udpSend), this.params.port, this.params.host);
    } else {
      logger.error('action: udp-output has nothing to send');
    }
  }
}
module.exports = UDPOutputAction;
