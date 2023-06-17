const Ajv = require('ajv');
const Trigger = require('./trigger');

const validate = new Ajv().compile(require('../schema/config.schema.json'));

class Config {
  constructor(configObj) {
    if (!validate(configObj)) {
      console.error(validate.errors);
      throw new Error('Invalid Config');
    }
    this.osc = configObj.osc;
    this.midi = configObj.midi;
    this.logLevel = configObj.logLevel;
    //TODO(jwetzell): is there a better way to load this
    // setup triggers as actual Trigger objects
    this.osc.triggers = this.osc.triggers.map((trigger) => new Trigger(trigger));
    this.midi.triggers = this.midi.triggers.map((trigger) => new Trigger(trigger));
  }
}

module.exports = Config;
