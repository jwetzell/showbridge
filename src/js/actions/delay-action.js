/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const Action = require('./action');
const { logger } = require('../utils/helper');

class DelayAction extends Action {
  constructor(obj) {
    super(obj);
    this.subActions = this.params.actions.map((subAction) => {
      try {
        const ActionClass = require(`../actions/${subAction.type}-action`);
        return new ActionClass(subAction);
      } catch (error) {
        logger.error(`delay: unhandled subaction type = ${subAction.type}`);
        return undefined;
      }
    });
  }

  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    if (this.params.duration !== undefined && this.params.actions !== undefined) {
      setTimeout(() => {
        this.subActions.forEach((subAction) => {
          subAction.do(msg, vars, servers);
        });
      }, this.params.duration);
    }
  }
}
module.exports = DelayAction;
