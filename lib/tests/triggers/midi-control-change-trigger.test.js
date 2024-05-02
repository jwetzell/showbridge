import assert from 'node:assert';
import { describe, test } from 'node:test';
import MIDIMessage from '../../src/messages/midi-message.js';
import UDPMessage from '../../src/messages/udp-message.js';
import { MIDIControlChangeTrigger } from '../../src/triggers/index.js';

describe('MIDIControlChangeTrigger', () => {
  test('create', () => {
    const trigger = new MIDIControlChangeTrigger({
      type: 'midi-control-change',
      params: {},
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    assert.notEqual(trigger, undefined);
  });

  test('no params', () => {
    const trigger = new MIDIControlChangeTrigger({
      type: 'midi-control-change',
      params: {},
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(new MIDIMessage([0xb0, 60, 127], 'test'));
    assert.strictEqual(fired, true);
  });

  test('not a midi message', () => {
    const trigger = new MIDIControlChangeTrigger({
      type: 'midi-control-change',
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

  test('not a control-change message', () => {
    const trigger = new MIDIControlChangeTrigger({
      type: 'midi-control-change',
      params: {},
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(new MIDIMessage([0x80, 60, 127], 'test'));
    assert.strictEqual(fired, false);
  });

  test('by port', () => {
    const trigger = new MIDIControlChangeTrigger({
      type: 'midi-control-change',
      params: {
        port: 'test',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const goodMessages = [
      new MIDIMessage([0xb0, 60, 127], 'test'),
      new MIDIMessage([0xb2, 60, 127], 'test'),
      new MIDIMessage([0xb0, 60, 100], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xb0, 61, 127], 'bad'),
      new MIDIMessage([0xb2, 64, 127], 'bad'),
      new MIDIMessage([0xb0, 63, 100], 'bad'),
    ];

    goodMessages.forEach((message) => {
      const fired = trigger.shouldFire(message);
      assert.strictEqual(fired, true);
    });
    badMessages.forEach((message) => {
      const fired = trigger.shouldFire(message);
      assert.strictEqual(fired, false);
    });
  });

  test('by channel', () => {
    const trigger = new MIDIControlChangeTrigger({
      type: 'midi-control-change',
      params: {
        channel: 1,
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const goodMessages = [
      new MIDIMessage([0xb0, 60, 127], 'test'),
      new MIDIMessage([0xb0, 60, 127], 'port1'),
      new MIDIMessage([0xb0, 60, 100], 'test'),
      new MIDIMessage([0xb0, 64, 100], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xb1, 61, 127], 'test'),
      new MIDIMessage([0xb2, 64, 127], 'port1'),
      new MIDIMessage([0xb2, 64, 127], 'bad'),
      new MIDIMessage([0xb6, 63, 100], 'bad'),
    ];

    goodMessages.forEach((message) => {
      const fired = trigger.shouldFire(message);
      assert.strictEqual(fired, true);
    });
    badMessages.forEach((message) => {
      const fired = trigger.shouldFire(message);
      assert.strictEqual(fired, false);
    });
  });

  test('by control', () => {
    const trigger = new MIDIControlChangeTrigger({
      type: 'midi-control-change',
      params: {
        control: 60,
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const goodMessages = [
      new MIDIMessage([0xb0, 60, 127], 'test'),
      new MIDIMessage([0xb2, 60, 127], 'test'),
      new MIDIMessage([0xb0, 60, 100], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xb0, 61, 127], 'test'),
      new MIDIMessage([0xb2, 64, 127], 'test'),
      new MIDIMessage([0xb0, 63, 100], 'test'),
    ];

    goodMessages.forEach((message) => {
      const fired = trigger.shouldFire(message);
      assert.strictEqual(fired, true);
    });
    badMessages.forEach((message) => {
      const fired = trigger.shouldFire(message);
      assert.strictEqual(fired, false);
    });
  });

  test('by value', () => {
    const trigger = new MIDIControlChangeTrigger({
      type: 'midi-control-change',
      params: {
        value: 0,
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const goodMessages = [
      new MIDIMessage([0xb0, 60, 0], 'test'),
      new MIDIMessage([0xb2, 60, 0], 'port1'),
      new MIDIMessage([0xb0, 60, 0], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xb0, 61, 100], 'test'),
      new MIDIMessage([0xb2, 64, 1], 'port2'),
      new MIDIMessage([0xb0, 63, 50], 'test'),
    ];

    goodMessages.forEach((message) => {
      const fired = trigger.shouldFire(message);
      assert.strictEqual(fired, true);
    });
    badMessages.forEach((message) => {
      const fired = trigger.shouldFire(message);
      assert.strictEqual(fired, false);
    });
  });
});
