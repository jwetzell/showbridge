const Action = require('../actions/action');

class Trigger {
  constructor(obj) {
    this.obj = obj;
    this.actions = obj.actions.map((action) => new Action(action));
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
