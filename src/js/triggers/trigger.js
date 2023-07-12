/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { logger } = require('../utils/helper');

class Trigger {
  constructor(obj) {
    this.obj = obj;

    this.loadActions();
  }

  loadActions() {
    if (this.obj.actions) {
      this.actions = this.obj.actions.map((action) => {
        try {
          const ActionClass = require(`../actions/${action.type}-action`);
          return new ActionClass(action);
        } catch (error) {
          logger.error(`action: unhandled action type = ${action.type}`);
          return undefined;
        }
      });
    }
  }

  get params() {
    return this.obj.params;
  }

  get type() {
    return this.obj.type;
  }

  get enabled() {
    return this.obj.enabled;
  }
}
module.exports = Trigger;
