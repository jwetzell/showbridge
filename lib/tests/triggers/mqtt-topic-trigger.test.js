import assert from 'node:assert';
import { describe, test } from 'node:test';
import MIDIMessage from '../../dist/lib/messages/midi-message.js';
import MQTTMessage from '../../dist/lib/messages/mqtt-message.js';
import { MQTTTopicTrigger } from '../../dist/lib/triggers/index.js';

describe('MQTTTopicTrigger', () => {
  test('create', () => {
    const trigger = new MQTTTopicTrigger({
      type: 'mqtt-topic',
      params: {
        topic: 'address',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    assert.notEqual(trigger, undefined);
    trigger.shouldFire(new MQTTMessage({ topic: 'address', payload: 'ok' }, { address: '127.0.0.1', port: 0 }));
  });

  test('no topic configured', () => {
    const trigger = new MQTTTopicTrigger({
      type: 'mqtt-topic',
      params: {},
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(
      new MQTTMessage({ topic: 'address', payload: 'ok' }, { address: '127.0.0.1', port: 0 })
    );
    assert.strictEqual(fired, false);
  });

  test('simple address match', () => {
    const trigger = new MQTTTopicTrigger({
      type: 'mqtt-topic',
      params: {
        topic: 'address',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(new MQTTMessage({ payload: 'ok' }, 'address'));
    assert.strictEqual(fired, true);
  });

  test('+ wildcard', () => {
    const trigger = new MQTTTopicTrigger({
      type: 'mqtt-topic',
      params: {
        topic: 'address/+',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const goodTopics = ['address/one', 'address/2'];
    const badTopics = ['address/a/couple/levels', 'this/wont/work'];

    goodTopics.forEach((topic) => {
      const fired = trigger.shouldFire(new MQTTMessage({ payload: 'ok' }, topic));
      assert.strictEqual(fired, true);
    });

    badTopics.forEach((topic) => {
      const fired = trigger.shouldFire(new MQTTMessage({ payload: 'ok' }, topic));
      assert.strictEqual(fired, false);
    });
  });

  test('# wildcard', () => {
    const trigger = new MQTTTopicTrigger({
      type: 'mqtt-topic',
      params: {
        topic: 'address/#',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const goodTopics = ['address/one', 'address/2', 'address/another/one'];
    const badTopics = ['this/wont/work'];

    goodTopics.forEach((topic) => {
      const fired = trigger.shouldFire(new MQTTMessage({ payload: 'ok' }, topic));
      assert.strictEqual(fired, true);
    });

    badTopics.forEach((topic) => {
      const fired = trigger.shouldFire(new MQTTMessage({ payload: 'ok' }, topic));
      assert.strictEqual(fired, false);
    });
  });

  test('non mqtt message', () => {
    const trigger = new MQTTTopicTrigger({
      type: 'mqtt-topic',
      params: {
        topic: 'address/#',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(new MIDIMessage([0xff], 'test'));
    assert.strictEqual(fired, false);
  });

  // TODO(jwetzell): add combined wildcard tests
});
