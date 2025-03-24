import { ConfigObj } from '@showbridge/types';
import {
  CloudProtocolParams,
  HTTPProtocolParams,
  MIDIProtocolParams,
  MQTTProtocolParams,
  TCPProtocolParams,
  UDPProtocolParams,
} from '@showbridge/types/dist/models/params/protocols.js';
import { Ajv, ValidateFunction } from 'ajv';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema.js';
import { cloneDeep, has } from 'lodash-es';
import { Trigger, TriggerTypeClassMap } from './triggers/index.js';
import getConfigMigrations from './utils/migrations.js';

type ConfigProtocols = {
  cloud: {
    params: CloudProtocolParams;
  };
  http: {
    params: HTTPProtocolParams;
  };
  midi: {
    params: MIDIProtocolParams;
  };
  mqtt: {
    params: MQTTProtocolParams;
  };
  tcp: {
    params: TCPProtocolParams;
  };
  udp: {
    params: UDPProtocolParams;
  };
};

type ConfigHandlers = {
  http: {
    triggers: Trigger<unknown>[];
  };
  midi: {
    triggers: Trigger<unknown>[];
  };
  mqtt: {
    triggers: Trigger<unknown>[];
  };
  osc: {
    triggers: Trigger<unknown>[];
  };
  tcp: {
    triggers: Trigger<unknown>[];
  };
  udp: {
    triggers: Trigger<unknown>[];
  };
  ws: {
    triggers: Trigger<unknown>[];
  };
};
class Config {
  schema: SomeJSONSchema;
  validate: ValidateFunction<unknown>;
  obj: ConfigObj;
  handlers: ConfigHandlers;
  protocols: ConfigProtocols;

  constructor(configObj: any, schema: SomeJSONSchema) {
    this.schema = schema;

    this.validate = new Ajv().compile(schema);

    const migratedConfig = this.migrate(configObj);
    if (!this.validate(migratedConfig)) {
      throw this.validate.errors;
    }

    this.obj = migratedConfig;
    this.loadHandlers();
    this.loadProtocols();
  }

  loadHandlers() {
    this.handlers = {
      http: {
        triggers: [],
      },
      midi: {
        triggers: [],
      },
      mqtt: {
        triggers: [],
      },
      osc: {
        triggers: [],
      },
      tcp: {
        triggers: [],
      },
      udp: {
        triggers: [],
      },
      ws: {
        triggers: [],
      },
    };
    Object.keys(this.obj.handlers).forEach((handlerType) => {
      if (this.obj.handlers) {
        this.handlers[handlerType] = this.obj.handlers[handlerType];

        // NOTE(jwetzell): turn trigger JSON into class instances
        this.handlers[handlerType].triggers = this.handlers[handlerType]?.triggers
          ?.filter((trigger) => has(TriggerTypeClassMap, trigger.type))
          .map((trigger) => new TriggerTypeClassMap[trigger.type](trigger));
      }
    });
  }

  loadProtocols() {
    this.protocols = {
      cloud: {
        params: {},
      },
      http: {
        params: {
          port: 3000,
        },
      },
      midi: {
        params: {},
      },
      mqtt: {
        params: {
          broker: '',
          topics: [],
        },
      },
      tcp: {
        params: {
          port: 8000,
        },
      },
      udp: {
        params: {
          port: 8000,
        },
      },
    };
    Object.keys(this.obj.protocols).forEach((protocolType) => {
      if (this.obj.protocols) {
        this.protocols[protocolType] = this.obj.protocols[protocolType];
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

  getTriggers(messageType: string): Trigger<unknown>[] {
    if (this.handlers[messageType] && this.handlers[messageType].triggers) {
      return this.handlers[messageType].triggers;
    }
    return [];
  }

  toJSON() {
    const config = cloneDeep(this.obj);
    if (config.$schema) {
      delete config.$schema;
    }
    // TODO(jwetzell): should toJSON be called on triggers?
    return config;
  }
}

export default Config;
