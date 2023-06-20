const Ajv = require('ajv');
const Trigger = require('./trigger');
const schema = require('../schema/config.schema.json');
const validate = new Ajv().compile(schema);

class Config {
  constructor(configObj) {
    if (!validate(configObj)) {
      throw validate.errors;
    }
    const messageTypes = ['http', 'ws', 'osc', 'midi'];
    messageTypes.forEach((messageType) => {
      this[messageType] = configObj[messageType];
      this[messageType].triggers = this[messageType].triggers.map((trigger) => new Trigger(trigger));
    });

    this.logLevel = configObj.logLevel;
  }

  getSchema() {
    return schema;
  }
}

module.exports = Config;
