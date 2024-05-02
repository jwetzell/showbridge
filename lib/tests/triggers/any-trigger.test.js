import assert from 'node:assert';
import { describe, test } from 'node:test';
import UDPMessage from '../../src/messages/udp-message.js';
import { AnyTrigger } from '../../src/triggers/index.js';

describe('AnyTrigger', () => {
  test('create', () => {
    const trigger = new AnyTrigger({
      type: 'any',
      params: {
        address: '127.0.0.1',
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
    trigger.shouldFire({});
  });

  test('anything fires', () => {
    const trigger = new AnyTrigger({
      type: 'any',
      params: {
        address: '127.0.0.1',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 }));
    assert.strictEqual(fired, true);
  });
});
