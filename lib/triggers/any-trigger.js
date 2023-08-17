const Trigger = require('./trigger');

class AnyTrigger extends Trigger {
  test(msg) {
    return msg !== undefined;
  }
}

module.exports = AnyTrigger;
