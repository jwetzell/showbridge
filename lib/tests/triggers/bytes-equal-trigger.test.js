import assert from 'node:assert';
import { describe, test } from 'node:test';
import UDPMessage from '../../src/messages/udp-message.js';
import { BytesEqualTrigger } from '../../src/triggers/index.js';

describe('BytesEqualTrigger', () => {
  test('create', () => {
    const trigger = new BytesEqualTrigger({
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

  // TODO(jwetzell): test other message types

  test('bytes match', () => {
    const trigger = new BytesEqualTrigger({
      type: 'any',
      params: {
        bytes: [0x01, 0x02, 0x03],
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(
      new UDPMessage(Buffer.from([0x01, 0x02, 0x03]), { address: '127.0.0.1', port: 0 })
    );
    assert.strictEqual(fired, true);
  });

  test('bytes mismatch', () => {
    const trigger = new BytesEqualTrigger({
      type: 'any',
      params: {
        bytes: [0x01, 0x02, 0x03],
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(
      new UDPMessage(Buffer.from([0x01, 0x02, 0x01]), { address: '127.0.0.1', port: 0 })
    );
    assert.strictEqual(fired, false);
  });
});
