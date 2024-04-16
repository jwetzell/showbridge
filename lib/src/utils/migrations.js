import { cloneDeep } from 'lodash-es';
import { logger } from './index.js';

// NOTE(jwetzell): I was really hoping to avoid this, but can't avoid breaking the config forever.
export function getConfigMigrations(configObj) {
  const migrations = [];

  // NOTE(jwetzell): cloud.params.room was removed in favor or cloud.params.rooms
  if (configObj?.cloud?.params?.room) {
    migrations.push((configObj) => {
      const migratedConfig = cloneDeep(configObj);
      logger.info(`migrations: converting singular cloud room config to rooms array`);
      migratedConfig.cloud.params.rooms = [configObj.cloud.params.room];
      delete migratedConfig.cloud.params.room;
      return migratedConfig;
    });
  }

  return migrations;
}
