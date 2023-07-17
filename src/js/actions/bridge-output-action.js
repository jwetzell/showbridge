const Action = require('./action');
const { logger } = require('../utils/helper');

class BridgeOutputAction extends Action {
  do(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.room) {
        protocols.bridge.send(resolvedParams.room, msg);
      } else if (resolvedParams.rooms) {
        resolvedParams.rooms.forEach((room) => {
          protocols.bridge.send(room, msg);
        });
      } else {
        logger.error('action: bridge-output action has no room specified');
      }
    } catch (error) {
      logger.error(`action: problem executing brdige-output action - ${error}`);
    }
  }
}
module.exports = BridgeOutputAction;
