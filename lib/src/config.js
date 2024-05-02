import Ajv from 'ajv';
import { cloneDeep, has } from 'lodash-es';
import { MessageTypeClassMap } from './messages/index.js';
import { TriggerTypeClassMap } from './triggers/index.js';
import { getConfigMigrations } from './utils/migrations.js';

class Config {
  constructor(configObj, schema) {
    this.schema = schema;

    this.validate = new Ajv().compile(schema);
    const migratedConfig = this.migrate(configObj);
    if (!this.validate(migratedConfig)) {
      throw this.validate.errors;
    }

    this.config = migratedConfig;
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

  migrate(configObj) {
    const migrations = getConfigMigrations(configObj);
    migrations.forEach((migration) => {
      configObj = migration(configObj);
    });
    return configObj;
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
    // TODO(jwetzell): should toJSON be called on triggers?
    return config;
  }
}

export default Config;
