const Ajv = require('ajv');
const Trigger = require('./triggers/trigger');
const RegexTrigger = require('./triggers/regex-trigger');
const schema = require('../schema/config.schema.json');
const { logger } = require('./utils/helper');
const SenderTrigger = require('./triggers/sender-trigger');
const BytesEqualTrigger = require('./triggers/bytes-equal-trigger');
const MIDINoteOnTrigger = require('./triggers/midi-note-on-triggers');
const MIDINoteOffTrigger = require('./triggers/midi-note-off-trigger');
const MIDIControlChangeTrigger = require('./triggers/midi-control-change-trigger');
const MIDIProgramChangeTrigger = require('./triggers/midi-program-change-trigger');
const OSCAddressTrigger = require('./triggers/osc-address-trigger');

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
    Config.MessageTypes.forEach((messageType) => {
      if (this.config[messageType]) {
        this[messageType] = this.config[messageType];
        this[messageType].triggers = this[messageType]?.triggers.map((trigger) => {
          if (Config.TriggerTypeClassMap[trigger.type]) {
            return new Config.TriggerTypeClassMap[trigger.type](trigger);
          }
          logger.error(`config: unhandled trigger type = ${trigger.type}`);
          return new Trigger(trigger);
        });
      }
    });
  }

  getSchema() {
    return schema;
  }

  static TriggerTypeClassMap = {
    regex: RegexTrigger,
    sender: SenderTrigger,
    'bytes-equal': BytesEqualTrigger,
    'midi-note-on': MIDINoteOnTrigger,
    'midi-note-off': MIDINoteOffTrigger,
    'midi-control-change': MIDIControlChangeTrigger,
    'midi-program-change': MIDIProgramChangeTrigger,
    'osc-address': OSCAddressTrigger,
  };

  static MessageTypes = ['http', 'ws', 'osc', 'midi', 'tcp', 'udp', 'mqtt'];
}

module.exports = Config;
