import assert from 'node:assert';
import { describe, test } from 'node:test';
import { RandomAction } from '../../dist/lib/actions/index.js';
import MIDIMessage from '../../dist/lib/messages/midi-message.js';

describe('RandomAction', () => {
  test('create', () => {
    const action = new RandomAction({
      type: 'random',
      params: {
        duration: 100,
        actions: [
          {
            type: 'log',
            enabled: true,
          },
        ],
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
  });

  test('runs one action', async () => {
    const action = new RandomAction({
      type: 'random',
      params: {
        actions: [
          {
            type: 'log',
            enabled: true,
          },
        ],
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    action.on('action', (actionPath, fired) => {
      assert.equal(actionPath, 'actions/0');
      assert.equal(fired, true);
    });

    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);
  });

  test('emits sub action events', async () => {
    const action = new RandomAction({
      type: 'random',
      params: {
        actions: [
          {
            type: 'random',
            params: {
              actions: [
                {
                  type: 'log',
                  enabled: true,
                },
              ],
            },
            enabled: true,
          },
        ],
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    action.on('action', (actionPath, fired) => {
      assert.equal(actionPath.startsWith('actions/0'), true);
      assert.equal(fired, true);
    });

    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);
  });

  test('emits transform events', async () => {
    const action = new RandomAction({
      type: 'random',
      params: {
        actions: [
          {
            type: 'random',
            params: {
              actions: [
                {
                  type: 'log',
                  enabled: true,
                },
              ],
            },
            transforms: [
              {
                type: 'scale',
                params: {
                  property: 'note',
                  inRange: [0, 127],
                  outRange: [0, 1],
                },
                enabled: true,
              },
            ],
            enabled: true,
          },
        ],
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    action.on('transform', (transformPath, fired) => {
      assert.equal(transformPath.startsWith('actions/0/transforms/0'), true);
      assert.equal(fired, true);
    });

    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);
  });
});
