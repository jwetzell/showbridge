/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const Ajv = require('ajv');
const schema = require('../schema/config.schema.json');
const { logger, messageTypes } = require('./utils/helper');

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
          try {
            // TODO(jwetzell): find a better way to dynamically load these classes
            const TriggerClass = require(`./triggers/${trigger.type}-trigger`);
            return new TriggerClass(trigger);
          } catch (error) {
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
