import assert from 'node:assert';
import { describe, test } from 'node:test';
import UDPMessage from '../../src/messages/udp-message.js';
import { SenderTrigger } from '../../src/triggers/index.js';

describe('SenderTrigger', () => {
  test('create', () => {
    const trigger = new SenderTrigger({
      type: 'sender',
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

  test('sender match', () => {
    const trigger = new SenderTrigger({
      type: 'sender',
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

  test('sender mismatch', () => {
    const trigger = new SenderTrigger({
      type: 'sender',
      params: {
        address: '10.0.0.1',
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
    assert.strictEqual(fired, false);
  });

  test('no sender', () => {
    const trigger = new SenderTrigger({
      type: 'sender',
      params: {},
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 }));
    assert.strictEqual(fired, false);
  });
});
