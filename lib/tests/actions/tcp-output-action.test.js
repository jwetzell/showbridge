import assert from 'node:assert';
import { describe, mock, test } from 'node:test';
import { TCPOutputAction } from '../../src/actions/index.js';
import MIDIMessage from '../../src/messages/midi-message.js';

describe('TCPOutputAction', () => {
  test('create', () => {
    const action = new TCPOutputAction({
      type: 'tcp-output',
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

  test('hex send', async () => {
    const action = new TCPOutputAction({
      type: 'tcp-output',
      params: {
        host: '127.0.0.1',
        port: 8000,
        hex: '0xbeef',
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    const mockSend = mock.fn((bytes, port, host, slip) => {});
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars, { tcp: { send: mockSend } });
    assert.deepEqual(mockSend.mock.calls[0].arguments[0], Buffer.from([0xbe, 0xef]));
  });

  test('hex send', async () => {
    const action = new TCPOutputAction({
      type: 'tcp-output',
      params: {
        host: '127.0.0.1',
        port: 8000,
        bytes: [0xbe, 0xef],
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    const mockSend = mock.fn((bytes, port, host, slip) => {});
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars, { tcp: { send: mockSend } });
    assert.deepEqual(mockSend.mock.calls[0].arguments[0], Buffer.from([0xbe, 0xef]));
  });

  test('string send', async () => {
    const action = new TCPOutputAction({
      type: 'tcp-output',
      params: {
        host: '127.0.0.1',
        port: 8000,
        string: 'test',
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};
    const mockSend = mock.fn((bytes, port, host, slip) => {});
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars, { tcp: { send: mockSend } });
    assert.deepEqual(mockSend.mock.calls[0].arguments[0], Buffer.from('test'));
  });

  test('template string send', async () => {
    const action = new TCPOutputAction({
      type: 'tcp-output',
      params: {
        host: '127.0.0.1',
        port: 8000,
        _string: '${msg.status}',
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    const mockSend = mock.fn((bytes, port, host, slip) => {});
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars, { tcp: { send: mockSend } });
    assert.deepEqual(mockSend.mock.calls[0].arguments[0], Buffer.from('note_off'));
  });

  test('missing payload', async () => {
    const action = new TCPOutputAction({
      type: 'tcp-output',
      params: {
        host: '127.0.0.1',
        port: 8000,
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    const mockSend = mock.fn((bytes, port, host, slip) => {});
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars, { tcp: { send: mockSend } });
    assert.deepEqual(mockSend.mock.calls.length, 0);
  });

  test('send error', async () => {
    const action = new TCPOutputAction({
      type: 'tcp-output',
      params: {
        host: '127.0.0.1',
        port: 8000,
        string: 'test',
      },
      transforms: [],
      enabled: true,
    });

    const vars = {};

    const mockSend = mock.fn((bytes, port, host, slip) => {
      throw new Error('send error');
    });
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars, { tcp: { send: mockSend } });
    assert.deepEqual(mockSend.mock.calls.length, 1);
  });
});
