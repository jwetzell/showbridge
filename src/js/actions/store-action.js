const _ = require('lodash');
const Action = require('./action');
const { logger } = require('../utils/helper');

class StoreAction extends Action {
  do(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      if (resolvedParams.key !== undefined && resolvedParams.value !== undefined) {
        _.set(vars, resolvedParams.key, resolvedParams.value);
      } else {
        logger.error('action: store action missing a key or value');
      }
    } catch (error) {
      logger.error(`action: problem executing store action - ${error}`);
    }
  }
}
module.exports = StoreAction;
