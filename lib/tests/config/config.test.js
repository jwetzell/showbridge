import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import Config from '../../src/config.js';

describe('Config', () => {
  // TODO(jwetzell): find better way to load schema

  test('create', () => {
    const schema = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../../schema/config.schema.json')));
    const goodConfig = JSON.parse(readFileSync(path.join(import.meta.dirname, './good_config.json')));
    const config = new Config(goodConfig, schema);

    assert.notStrictEqual(config, undefined);
  });

  test('bad config', () => {
    const schema = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../../schema/config.schema.json')));
    const badConfig = JSON.parse(readFileSync(path.join(import.meta.dirname, './bad_config.json')));

    assert.throws(() => {
      // eslint-disable-next-line no-unused-vars
      const config = new Config(badConfig, schema);
    });
  });

  test('cloud room migration', () => {
    const schema = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../../schema/config.schema.json')));
    const cloudSingleRoomConfig = JSON.parse(
      readFileSync(path.join(import.meta.dirname, './cloud_single_room_config.json'))
    );

    const config = new Config(cloudSingleRoomConfig, schema);
    assert.deepStrictEqual(config.cloud.params.rooms, ['test']);
  });

  test('getTriggers', () => {
    const schema = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../../schema/config.schema.json')));
    const goodConfig = JSON.parse(readFileSync(path.join(import.meta.dirname, './good_config.json')));
    const config = new Config(goodConfig, schema);

    assert.notStrictEqual(config, undefined);
    assert.strictEqual(config.getTriggers('http')[0].type, 'any');
    assert.strictEqual(config.getTriggers('udp')[0].type, 'any');
    assert.strictEqual(config.getTriggers('osc')[0], undefined);
  });

  test('toJSON', () => {
    const schema = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../../schema/config.schema.json')));
    const goodConfig = JSON.parse(readFileSync(path.join(import.meta.dirname, './good_config.json')));
    const config = new Config(goodConfig, schema);

    assert.notStrictEqual(config, undefined);
    const toJSON = config.toJSON();
    console.log(toJSON);
    assert.strictEqual(toJSON.http.triggers[0].comment, undefined);
    assert.strictEqual(toJSON.http.triggers[0].type, 'any');
    assert.strictEqual(toJSON.osc.triggers[0], undefined);
    assert.strictEqual(toJSON.ws.triggers[0].actions[0].type, 'log');
    assert.strictEqual(toJSON.ws.triggers[0].actions[0].comment, undefined);
    assert.strictEqual(toJSON.ws.triggers[0].actions[0].transforms.length, 0);
    assert.strictEqual(toJSON.$schema, undefined);
  });
});
