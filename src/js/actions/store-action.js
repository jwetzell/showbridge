const _ = require('lodash');
const Action = require('./action');
const { logger, resolveTemplatedProperty } = require('../utils/helper');

class StoreAction extends Action {
  do(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    try {
      const value = resolveTemplatedProperty(this.params, 'value', { msg, vars });
      const key = resolveTemplatedProperty(this.params, 'key', { msg, vars });

      if (key !== undefined && value !== undefined) {
        _.set(vars, key, value);
      } else {
        logger.error('action: store action missing a key or value');
      }
    } catch (error) {
      logger.error(`action: problem executing store action - ${error}`);
    }
  }
}
module.exports = StoreAction;
