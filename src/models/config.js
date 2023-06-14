//TODO(jwetzell): config validation against schema
const Trigger = require('./trigger');

class Config {
  constructor(configObj) {
    this.osc = configObj.osc;
    this.midi = configObj.midi;
    //TODO(jwetzell): is there a better way to load this
    // setup triggers as actual Trigger objects
    this.osc.triggers = this.osc.triggers.map((trigger) => new Trigger(trigger));
    this.midi.triggers = this.midi.triggers.map((trigger) => new Trigger(trigger));
  }
}

module.exports = Config;
