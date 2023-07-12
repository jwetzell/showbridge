const Action = require('./action');
const { logger, hexToBytes, resolveTemplatedProperty } = require('../utils/helper');

class TCPOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    let tcpSend;

    if (this.params.bytes !== undefined) {
      tcpSend = this.params.bytes;
    } else if (this.params.hex !== undefined) {
      tcpSend = hexToBytes(this.params.hex);
    } else {
      // check for string or _string
      tcpSend = resolveTemplatedProperty(this.params, 'string', { msg, vars });
    }

    if (tcpSend !== undefined) {
      servers.tcp.send(Buffer.from(tcpSend), this.params.port, this.params.host, this.params.slip);
    } else {
      logger.error('action: tcp-output has nothing to send');
    }
  }
}
module.exports = TCPOutputAction;
