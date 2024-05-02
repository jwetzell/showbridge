import assert from 'node:assert';
import { describe, test } from 'node:test';
import MIDIMessage from '../../src/messages/midi-message.js';
import UDPMessage from '../../src/messages/udp-message.js';
import { MIDIProgramChangeTrigger } from '../../src/triggers/index.js';

describe('MIDIProgramChangeTrigger', () => {
  test('create', () => {
    const trigger = new MIDIProgramChangeTrigger({
      type: 'midi-program-change',
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
    const trigger = new MIDIProgramChangeTrigger({
      type: 'midi-program-change',
      params: {},
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(new MIDIMessage([0xc0, 60, 127], 'test'));
    assert.strictEqual(fired, true);
  });

  test('not a midi message', () => {
    const trigger = new MIDIProgramChangeTrigger({
      type: 'midi-program-change',
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

  test('not a program-change message', () => {
    const trigger = new MIDIProgramChangeTrigger({
      type: 'midi-program-change',
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
    const trigger = new MIDIProgramChangeTrigger({
      type: 'midi-program-change',
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
      new MIDIMessage([0xc0, 60], 'test'),
      new MIDIMessage([0xc2, 60], 'test'),
      new MIDIMessage([0xc3, 64], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xc0, 61], 'bad'),
      new MIDIMessage([0xc2, 64], 'bad'),
      new MIDIMessage([0xc0, 63], 'bad'),
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
    const trigger = new MIDIProgramChangeTrigger({
      type: 'midi-program-change',
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
      new MIDIMessage([0xc0, 60], 'test'),
      new MIDIMessage([0xc0, 63], 'port1'),
      new MIDIMessage([0xc0, 64], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xc1, 61], 'test'),
      new MIDIMessage([0xc2, 64], 'port1'),
      new MIDIMessage([0xc2, 64], 'bad'),
      new MIDIMessage([0xc6, 63], 'bad'),
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

  test('by program', () => {
    const trigger = new MIDIProgramChangeTrigger({
      type: 'midi-program-change',
      params: {
        program: 60,
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
      new MIDIMessage([0xc0, 60], 'test'),
      new MIDIMessage([0xc2, 60], 'test'),
      new MIDIMessage([0xc0, 60], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xc0, 61], 'test'),
      new MIDIMessage([0xc2, 64], 'test'),
      new MIDIMessage([0xc0, 63], 'test'),
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
