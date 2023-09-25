import { betterAjvErrors } from '@apideck/better-ajv-errors';
import Ajv from 'ajv';
import { cloneDeep, has } from 'lodash-es';
import { MessageTypeClassMap, TriggerTypeClassMap, logger } from './utils/index.js';

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
    this.cloud = this.config.cloud;
  }

  loadTriggers() {
    Object.keys(MessageTypeClassMap).forEach((messageType) => {
      if (this.config[messageType]) {
        this[messageType] = this.config[messageType];
        this[messageType].triggers = this[messageType]?.triggers?.map((trigger) => {
          if (has(TriggerTypeClassMap, trigger.type)) {
            return new TriggerTypeClassMap[trigger.type](trigger);
          }
          logger.error(`config: unhandled trigger type = ${trigger.type}`);
          return undefined;
        });
      }
    });
  }

  getSchema() {
    return this.schema;
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
