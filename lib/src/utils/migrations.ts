import { ConfigObj } from '@showbridge/types';
import { cloneDeep } from 'lodash-es';
import { logger } from './index.js';

// NOTE(jwetzell): I was really hoping to avoid this, but can't avoid breaking the config forever.
export default function getConfigMigrations(configObj: any): { (configObj: any): ConfigObj }[] {
  const migrations = [];

  // NOTE(jwetzell): cloud.params.room was removed in favor or cloud.params.rooms
  if (configObj?.cloud?.params?.room) {
    migrations.push((config) => {
      const migratedConfig = cloneDeep(config);
      logger.info(`migrations: converting singular cloud room config to rooms array`);
      migratedConfig.cloud.params.rooms = [config.cloud.params.room];
      delete migratedConfig.cloud.params.room;
      return migratedConfig;
    });
  }

  if (configObj?.http || configObj?.cloud || configObj?.midi) {
    migrations.push((config) => {
      const migratedConfig = {
        protocols: {
          cloud: {},
          http: {},
          midi: {},
          mqtt: {},
          tcp: {},
          udp: {},
        },
        handlers: {
          http: {},
          midi: {},
          mqtt: {},
          osc: {},
          tcp: {},
          udp: {},
          ws: {},
        },
      };
      logger.info(`migrations: converting from flat config to protocols and handlers format`);
      if (config.cloud !== undefined) {
        if (config.cloud.params) {
          migratedConfig.protocols.cloud = {
            params: cloneDeep(config.cloud.params),
          };
        }
      }

      if (config.http !== undefined) {
        if (config.http.params) {
          migratedConfig.protocols.http = {
            params: cloneDeep(config.http.params),
          };
        }
        if (config.http.triggers) {
          migratedConfig.handlers.http = {
            triggers: cloneDeep(config.http.triggers),
          };
        }
      }
      if (config.midi !== undefined) {
        if (config.midi.params) {
          migratedConfig.protocols.midi = {
            params: cloneDeep(config.midi.params),
          };
        }
        if (config.midi.triggers) {
          migratedConfig.handlers.midi = {
            triggers: cloneDeep(config.midi.triggers),
          };
        }
      }
      if (config.mqtt !== undefined) {
        if (config.mqtt.params) {
          migratedConfig.protocols.mqtt = {
            params: cloneDeep(config.mqtt.params),
          };
        }
        if (config.mqtt.triggers) {
          migratedConfig.handlers.mqtt = {
            triggers: cloneDeep(config.mqtt.triggers),
          };
        }
      }
      if (config.osc !== undefined) {
        if (config.osc.triggers) {
          migratedConfig.handlers.osc = {
            triggers: cloneDeep(config.osc.triggers),
          };
        }
      }
      if (config.tcp !== undefined) {
        if (config.tcp.params) {
          migratedConfig.protocols.tcp = {
            params: cloneDeep(config.tcp.params),
          };
        }
        if (config.tcp.triggers) {
          migratedConfig.handlers.tcp = {
            triggers: cloneDeep(config.tcp.triggers),
          };
        }
      }
      if (config.udp !== undefined) {
        if (config.udp.params) {
          migratedConfig.protocols.udp = {
            params: cloneDeep(config.udp.params),
          };
        }
        if (config.udp.triggers) {
          migratedConfig.handlers.udp = {
            triggers: cloneDeep(config.udp.triggers),
          };
        }
      }

      if (config.ws !== undefined) {
        if (config.ws.triggers) {
          migratedConfig.handlers.ws = {
            triggers: cloneDeep(config.ws.triggers),
          };
        }
      }

      return migratedConfig;
    });
  }

  return migrations;
}
