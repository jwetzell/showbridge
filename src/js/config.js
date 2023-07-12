const Ajv = require('ajv');
const schema = require('../schema/config.schema.json');
const { logger, messageTypes } = require('./utils/helper');
const BytesEqualTrigger = require('./triggers/bytes-equal-trigger');
const MIDIControlChangeTrigger = require('./triggers/midi-control-change-trigger');
const MIDINoteOffTrigger = require('./triggers/midi-note-off-trigger');
const MIDINoteOnTrigger = require('./triggers/midi-note-on-trigger');
const MIDIProgramChangeTrigger = require('./triggers/midi-program-change-trigger');
const OSCAddressTrigger = require('./triggers/osc-address-trigger');
const RegexTrigger = require('./triggers/regex-trigger');
const SenderTrigger = require('./triggers/sender-trigger');

const validate = new Ajv().compile(schema);

class Config {
  constructor(configObj) {
    this.config = configObj;
    if (!validate(configObj)) {
      throw validate.errors;
    } else {
      this.loadTriggers();
    }
  }

  loadTriggers() {
    messageTypes.forEach((messageType) => {
      if (this.config[messageType]) {
        this[messageType] = this.config[messageType];
        this[messageType].triggers = this[messageType]?.triggers.map((trigger) => {
          // TODO(jwetzell): find a better way to dynamically load these classes
          switch (trigger.type) {
            case 'bytes-equal':
              return new BytesEqualTrigger(trigger);
            case 'midi-control-change':
              return new MIDIControlChangeTrigger(trigger);
            case 'midi-note-off':
              return new MIDINoteOffTrigger(trigger);
            case 'midi-note-on':
              return new MIDINoteOnTrigger(trigger);
            case 'midi-program-change':
              return new MIDIProgramChangeTrigger(trigger);
            case 'osc-address':
              return new OSCAddressTrigger(trigger);
            case 'regex':
              return new RegexTrigger(trigger);
            case 'sender':
              return new SenderTrigger(trigger);
            default:
              logger.error(`config: unhandled trigger type = ${trigger.type}`);
              return undefined;
          }
        });
      }
    });
  }

  getSchema() {
    return schema;
  }
}

module.exports = Config;
