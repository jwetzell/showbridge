import { Ajv, ValidateFunction } from 'ajv';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema.js';
import { cloneDeep, has } from 'lodash-es';
import { MessageTypeClassMap } from './messages/index.js';
import { Trigger, TriggerTypeClassMap } from './triggers/index.js';
import getConfigMigrations from './utils/migrations.js';

export type ProtocolObj = {
  params: { [key: string]: any };
  triggers: Trigger[];
};

export type ConfigObj = {
  $schema?: string;
  http: ProtocolObj;
  ws: ProtocolObj;
  osc: ProtocolObj;
  tcp: ProtocolObj;
  udp: ProtocolObj;
  midi: ProtocolObj;
  mqtt: ProtocolObj;
  cloud: ProtocolObj;
};

class Config {
  schema: SomeJSONSchema;
  validate: ValidateFunction<unknown>;
  config: ConfigObj;

  constructor(configObj: any, schema: SomeJSONSchema) {
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

  migrate(configObj: ConfigObj): ConfigObj {
    const migrations = getConfigMigrations(configObj);
    let migratedConfig = cloneDeep(configObj) as ConfigObj;
    migrations.forEach((migration) => {
      migratedConfig = migration(migratedConfig);
    });
    return migratedConfig;
  }

  getTriggers(messageType: string): Trigger[] {
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
