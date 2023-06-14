class Action {
  constructor(actionObj) {
    this.type = actionObj.type;
    this.params = actionObj.params;
    this.enabled = actionObj.enabled;
  }
}
module.exports = Action;
