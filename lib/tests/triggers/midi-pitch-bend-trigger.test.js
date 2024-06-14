import assert from 'node:assert';
import { describe, test } from 'node:test';
import MIDIMessage from '../../dist/lib/messages/midi-message.js';
import UDPMessage from '../../dist/lib/messages/udp-message.js';
import { MIDIPitchBendTrigger } from '../../dist/lib/triggers/index.js';

describe('MIDIPitchBendTrigger', () => {
  test('create', () => {
    const trigger = new MIDIPitchBendTrigger({
      type: 'midi-pitch-bend',
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
    const trigger = new MIDIPitchBendTrigger({
      type: 'midi-pitch-bend',
      params: {},
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(new MIDIMessage([0xe0, 60, 127], 'test'));
    assert.strictEqual(fired, true);
  });

  test('not a midi message', () => {
    const trigger = new MIDIPitchBendTrigger({
      type: 'midi-pitch-bend',
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

  test('not a pitch-bend message', () => {
    const trigger = new MIDIPitchBendTrigger({
      type: 'midi-pitch-bend',
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
    const trigger = new MIDIPitchBendTrigger({
      type: 'midi-pitch-bend',
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
      new MIDIMessage([0xe0, 60, 127], 'test'),
      new MIDIMessage([0xe2, 60, 127], 'test'),
      new MIDIMessage([0xe0, 60, 100], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xe0, 61, 127], 'bad'),
      new MIDIMessage([0xe2, 64, 127], 'bad'),
      new MIDIMessage([0xe0, 63, 100], 'bad'),
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
    const trigger = new MIDIPitchBendTrigger({
      type: 'midi-pitch-bend',
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
      new MIDIMessage([0xe0, 60, 127], 'test'),
      new MIDIMessage([0xe0, 60, 127], 'port1'),
      new MIDIMessage([0xe0, 60, 100], 'test'),
      new MIDIMessage([0xe0, 64, 100], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xe1, 61, 127], 'test'),
      new MIDIMessage([0xe2, 64, 127], 'port1'),
      new MIDIMessage([0xe2, 64, 127], 'bad'),
      new MIDIMessage([0xe6, 63, 100], 'bad'),
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
    const trigger = new MIDIPitchBendTrigger({
      type: 'midi-pitch-bend',
      params: {
        value: 60,
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
      new MIDIMessage([0xe0, 60, 0], 'test'),
      new MIDIMessage([0xe2, 60, 0], 'port1'),
      new MIDIMessage([0xe0, 60, 0], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0xe0, 61, 100], 'test'),
      new MIDIMessage([0xe2, 64, 1], 'port2'),
      new MIDIMessage([0xe0, 63, 50], 'test'),
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
