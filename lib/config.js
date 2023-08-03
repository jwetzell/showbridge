const Ajv = require('ajv');
const { betterAjvErrors } = require('@apideck/better-ajv-errors');
const { cloneDeep } = require('lodash');
const schema = require('../schema/config.schema.json');
const { logger } = require('./utils');
const {
  BytesEqualTrigger,
  MIDIControlChangeTrigger,
  MIDINoteOffTrigger,
  MIDINoteOnTrigger,
  MIDIProgramChangeTrigger,
  OSCAddressTrigger,
  RegexTrigger,
  SenderTrigger,
  AnyTrigger,
} = require('./triggers');

const ajv = new Ajv();
ajv.addSchema(schema);
const messageTypes = ['http', 'ws', 'osc', 'midi', 'tcp', 'udp', 'mqtt'];

class Config {
  constructor(configObj) {
    if (!ajv.validate('Config', configObj)) {
      const errors = betterAjvErrors({
        errors: ajv.errors,
        data: configObj,
        schema,
      });
      throw errors;
    }

    this.config = configObj;
    this.loadTriggers();
    this.cloud = this.config.cloud;
  }

  loadTriggers() {
    messageTypes.forEach((messageType) => {
      if (this.config[messageType]) {
        this[messageType] = this.config[messageType];
        this[messageType].triggers = this[messageType]?.triggers?.map((trigger) => {
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
            case 'any':
              return new AnyTrigger(trigger);
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

  toJSON() {
    const config = cloneDeep(this.config);
    if (config.$schema) {
      delete config.$schema;
    }
    return config;
  }
}

module.exports = Config;
