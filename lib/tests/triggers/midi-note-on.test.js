import assert from 'node:assert';
import { describe, test } from 'node:test';
import MIDIMessage from '../../src/messages/midi-message.js';
import UDPMessage from '../../src/messages/udp-message.js';
import { MIDINoteOnTrigger } from '../../src/triggers/index.js';

describe('MIDINoteOnTrigger', () => {
  test('create', () => {
    const trigger = new MIDINoteOnTrigger({
      type: 'midi-note-on',
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
    const trigger = new MIDINoteOnTrigger({
      type: 'midi-note-on',
      params: {},
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(new MIDIMessage([0x90, 60, 127], 'test'));
    assert.strictEqual(fired, true);
  });

  test('not a midi message', () => {
    const trigger = new MIDINoteOnTrigger({
      type: 'midi-note-on',
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

  test('not a note-off message', () => {
    const trigger = new MIDINoteOnTrigger({
      type: 'midi-note-on',
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
    const trigger = new MIDINoteOnTrigger({
      type: 'midi-note-on',
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
      new MIDIMessage([0x90, 60, 127], 'test'),
      new MIDIMessage([0x92, 60, 127], 'test'),
      new MIDIMessage([0x90, 60, 100], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0x90, 61, 127], 'bad'),
      new MIDIMessage([0x92, 64, 127], 'bad'),
      new MIDIMessage([0x90, 63, 100], 'bad'),
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
    const trigger = new MIDINoteOnTrigger({
      type: 'midi-note-on',
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
      new MIDIMessage([0x90, 60, 127], 'test'),
      new MIDIMessage([0x90, 60, 127], 'port1'),
      new MIDIMessage([0x90, 60, 100], 'test'),
      new MIDIMessage([0x90, 64, 100], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0x91, 61, 127], 'test'),
      new MIDIMessage([0x92, 64, 127], 'port1'),
      new MIDIMessage([0x92, 64, 127], 'bad'),
      new MIDIMessage([0x96, 63, 100], 'bad'),
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

  test('by note', () => {
    const trigger = new MIDINoteOnTrigger({
      type: 'midi-note-on',
      params: {
        note: 60,
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
      new MIDIMessage([0x90, 60, 127], 'test'),
      new MIDIMessage([0x92, 60, 127], 'test'),
      new MIDIMessage([0x90, 60, 100], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0x90, 61, 127], 'test'),
      new MIDIMessage([0x92, 64, 127], 'test'),
      new MIDIMessage([0x90, 63, 100], 'test'),
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

  test('by velocity', () => {
    const trigger = new MIDINoteOnTrigger({
      type: 'midi-note-on',
      params: {
        velocity: 0,
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
      new MIDIMessage([0x90, 60, 0], 'test'),
      new MIDIMessage([0x92, 60, 0], 'port1'),
      new MIDIMessage([0x90, 60, 0], 'test'),
    ];

    const badMessages = [
      new MIDIMessage([0x90, 61, 100], 'test'),
      new MIDIMessage([0x92, 64, 1], 'port2'),
      new MIDIMessage([0x90, 63, 50], 'test'),
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
