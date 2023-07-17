const Action = require('./action');
const { logger } = require('../utils/helper');

class BridgeOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.room) {
        servers.bridge.send(resolvedParams.room, msg);
      } else if (resolvedParams.rooms) {
        resolvedParams.rooms.forEach((room) => {
          servers.bridge.send(room, msg);
        });
      } else {
        logger.error('bridge-output: no room specified');
      }
    } catch (error) {
      logger.error(`action: problem executing brdige-output action - ${error}`);
    }
  }
}
module.exports = BridgeOutputAction;
