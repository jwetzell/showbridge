const osc = require('osc-min');
const Action = require('./action');
const { logger } = require('../utils/helper');

class OSCOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.address === undefined) {
        logger.error('action: either address or _address property need to be set for osc-output action');
        return;
      }
      if (resolvedParams.args === undefined) {
        resolvedParams.args = [];
      }

      const outBuff = osc.toBuffer({
        address: resolvedParams.address,
        args: resolvedParams.args,
      });

      if (resolvedParams.protocol === 'udp') {
        servers.udp.send(outBuff, resolvedParams.port, resolvedParams.host);
      } else if (resolvedParams.protocol === 'tcp') {
        servers.tcp.send(outBuff, resolvedParams.port, resolvedParams.host, true);
      } else {
        logger.error(`action: unhandled osc output protocol = ${resolvedParams.protocol}`);
      }
    } catch (error) {
      logger.error(`action: problem executing osc-output action - ${error}`);
    }
  }
}

module.exports = OSCOutputAction;
