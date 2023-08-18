const Action = require('./action');
const { logger } = require('../utils');

class CloudOutputAction extends Action {
  doFunction(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.room) {
        protocols.cloud.send(resolvedParams.room, msg);
      } else if (resolvedParams.rooms) {
        resolvedParams.rooms.forEach((room) => {
          protocols.cloud.send(room, msg);
        });
      } else {
        logger.error('action: cloud-output action has no room specified');
      }
    } catch (error) {
      logger.error(`action: problem executing cloud-output action - ${error}`);
    }
    this.emit('finished');
  }
}
module.exports = CloudOutputAction;
