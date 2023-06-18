const Ajv = require('ajv');
const Trigger = require('./trigger');
const schema = require('../schema/config.schema.json');
const validate = new Ajv().compile(schema);

class Config {
  constructor(configObj) {
    if (!validate(configObj)) {
      throw validate.errors;
    }
    this.http = configObj.http;
    this.osc = configObj.osc;
    this.midi = configObj.midi;
    this.logLevel = configObj.logLevel;
    //TODO(jwetzell): is there a better way to load this
    // setup triggers as actual Trigger objects
    this.osc.triggers = this.osc.triggers.map((trigger) => new Trigger(trigger));
    this.midi.triggers = this.midi.triggers.map((trigger) => new Trigger(trigger));
  }

  getSchema() {
    return schema;
  }
}

module.exports = Config;
