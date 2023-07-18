const Trigger = require('./trigger');

class AnyTrigger extends Trigger {
  shouldFire() {
    return true;
  }
}

module.exports = AnyTrigger;
