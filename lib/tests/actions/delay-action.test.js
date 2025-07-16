import assert from 'node:assert';
import { describe, test } from 'node:test';
import { DelayAction } from '../../dist/lib/actions/index.js';
import MIDIMessage from '../../dist/lib/messages/midi-message.js';

describe('DelayAction', () => {
  test('create', () => {
    const action = new DelayAction({
      type: 'delay',
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

  test('delay accurate within reason', async () => {
    const action = new DelayAction({
      type: 'delay',
      params: {
        duration: 250,
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
    const vars = {};
    const runTime = Date.now();

    action.on('action', (subAction, actionPath, fired) => {
      const timeToRun = Math.abs(Date.now() - runTime - action.params.duration);
      assert.equal(subAction.type, action.params.actions[0].type);
      assert.equal(actionPath, 'actions/0');
      assert.equal(fired, true);
      assert.equal(timeToRun < 10, true);
    });

    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);
  });

  test('delay with sub delay', async () => {
    const action = new DelayAction({
      type: 'delay',
      params: {
        duration: 250,
        actions: [
          {
            type: 'delay',
            params: {
              duration: 250,
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

    assert.notEqual(action, undefined);
    const vars = {};
    const runTime = Date.now();

    let actionCount = 1;
    action.on('action', (subAction, actionPath, fired) => {
      const timeToRun = Math.abs(Date.now() - runTime - action.params.duration * actionCount);
      if (actionCount === 1) {
        assert.equal(actionPath, 'actions/0');
      } else {
        assert.equal(actionPath, 'actions/0/actions/0');
      }
      assert.equal(fired, true);
      assert.equal(timeToRun < 10, true);
      actionCount += 1;
    });

    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);
  });

  test('delay emits transforms', async () => {
    const action = new DelayAction({
      type: 'delay',
      params: {
        duration: 500,
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
    });

    assert.notEqual(action, undefined);
    const vars = {};

    action.on('transform', (transformPath, fired) => {
      assert.equal(transformPath, 'transforms/0');
      assert.equal(fired, true);
    });

    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);
  });
});
