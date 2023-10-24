import { betterAjvErrors } from '@apideck/better-ajv-errors';
import Ajv from 'ajv';
import { cloneDeep, has } from 'lodash-es';
import { MessageTypeClassMap, TriggerTypeClassMap } from './utils/index.js';

const ajv = new Ajv();

class Config {
  constructor(configObj, schema) {
    this.schema = schema;
    // TODO(jwetzell): I don't really like this and seems like it will become annoying
    ajv.removeSchema('Config');
    ajv.addSchema(schema);
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
  }

  loadTriggers() {
    Object.keys(MessageTypeClassMap).forEach((messageType) => {
      if (this.config[messageType]) {
        this[messageType] = this.config[messageType];

        // NOTE(jwetzell): turn trigger JSON into class instances
        this[messageType].triggers = this[messageType]?.triggers
          ?.filter((trigger) => has(TriggerTypeClassMap, trigger.type))
          .map((trigger) => new TriggerTypeClassMap[trigger.type](trigger));
      }
    });
  }

  getTriggers(messageType) {
    if (this[messageType] && this[messageType].triggers) {
      return this[messageType].triggers;
    }
    return [];
  }

  get cloud() {
    return this.config.cloud;
  }

  toJSON() {
    const config = cloneDeep(this.config);
    if (config.$schema) {
      delete config.$schema;
    }
    return config;
  }
}

export default Config;
