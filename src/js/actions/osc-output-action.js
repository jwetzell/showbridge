const osc = require('osc-min');
const Action = require('./action');
const { logger } = require('../utils/helper');
const { resolveTemplatedProperty } = require('../utils/helper');

class OSCOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const address = resolveTemplatedProperty(this.params, 'address', { msg, vars });

      if (address === undefined) {
        logger.error('action: either address or _address property need to be set for osc-output action');
        return;
      }

      let args = resolveTemplatedProperty(this.params, 'args', { msg, vars });
      if (args === undefined) {
        args = [];
      }

      const outBuff = osc.toBuffer({
        address,
        args,
      });

      if (this.params.protocol === 'udp') {
        servers.udp.send(outBuff, this.params.port, this.params.host);
      } else if (this.params.protocol === 'tcp') {
        servers.tcp.send(outBuff, this.params.port, this.params.host, true);
      } else {
        logger.error(`action: unhandled osc output protocol = ${this.params.protocol}`);
      }
    } catch (error) {
      logger.error(`action: error outputting osc - ${error}`);
    }
  }
}

module.exports = OSCOutputAction;
