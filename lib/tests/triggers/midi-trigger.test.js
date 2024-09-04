import assert from 'node:assert';
import { describe, test } from 'node:test';
import MIDIMessage from '../../dist/lib/messages/midi-message.js';
import UDPMessage from '../../dist/lib/messages/udp-message.js';
import { MIDITrigger } from '../../dist/lib/triggers/index.js';

describe('MIDITrigger', () => {
  test('create', () => {
    const trigger = new MIDITrigger({
      type: 'midi',
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
    const trigger = new MIDITrigger({
      type: 'midi',
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
    const trigger = new MIDITrigger({
      type: 'midi',
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

  test('by port', () => {
    const trigger = new MIDITrigger({
      type: 'midi',
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

  test('by templated port', () => {
    const trigger = new MIDITrigger({
      type: 'midi',
      params: {
        // eslint-disable-next-line no-template-curly-in-string
        _port: '${vars.portName}',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const vars = {
      portName: 'test',
    };

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
      const fired = trigger.shouldFire(message, vars);
      assert.strictEqual(fired, true);
    });
    badMessages.forEach((message) => {
      const fired = trigger.shouldFire(message, vars);
      assert.strictEqual(fired, false);
    });
  });
});
