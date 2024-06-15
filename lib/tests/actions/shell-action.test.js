/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-unused-vars */
import assert from 'node:assert';
import { describe, test } from 'node:test';
import { ShellAction } from '../../dist/lib/actions/index.js';
import { MIDIMessage } from '../../dist/lib/messages/index.js';

describe('ShellAction', () => {
  test('create', () => {
    const action = new ShellAction({
      type: 'shell',
      params: {
        command: 'echo hello',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
  });

  test('simple command', () => {
    const action = new ShellAction({
      type: 'shell',
      params: {
        command: 'echo hello',
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    // const mockSend = mock.fn((bytes, port, host, slip) => {});
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);
    // assert.deepEqual(mockSend.mock.calls[0].arguments[0], Buffer.from([0xbe, 0xef]));
    assert.notEqual(action, undefined);
  });

  test('bad command', () => {
    const action = new ShellAction({
      type: 'shell',
      params: {
        command: 'asdfasdf',
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    // const mockSend = mock.fn((bytes, port, host, slip) => {});
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);
    // assert.deepEqual(mockSend.mock.calls[0].arguments[0], Buffer.from([0xbe, 0xef]));
    assert.notEqual(action, undefined);
  });
  // TODO(jwetzell): error testing
});
