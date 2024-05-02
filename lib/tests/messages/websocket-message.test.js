import assert from 'node:assert';
import { describe, test } from 'node:test';
import WebSocketMessage from '../../src/messages/websocket-message.js';

describe('WebSocketMessage', () => {
  test('create WebSocketMessage', () => {
    const message = new WebSocketMessage('hello', { address: '127.0.0.1', port: 0 });
    assert.equal(message.messageType, 'ws');
  });

  test('string WebSocketMessage payload', () => {
    const payload = 'hello';
    const sender = { address: '127.0.0.1', port: 0 };
    const message = new WebSocketMessage(payload, sender);
    assert.equal(typeof message.payload, 'string');
    assert.equal(message.payload, payload);
    assert.equal(message.toString(), payload);
    assert.deepEqual(message.bytes, Buffer.from(payload));
    assert.deepEqual(message.toJSON(), {
      messageType: 'ws',
      msg: payload,
      sender: sender,
    });
  });

  test('JSON WebSocketMessage payload', () => {
    const payload = JSON.stringify({ key: 'hello' });
    const sender = { address: '127.0.0.1', port: 0 };

    const message = new WebSocketMessage(payload, sender);
    assert.equal(typeof message.payload, 'object');
    assert.deepEqual(message.payload, JSON.parse(payload));
    assert.deepEqual(message.bytes, Buffer.from(payload));
    assert.deepEqual(message.toJSON(), {
      messageType: 'ws',
      msg: payload,
      sender: sender,
    });
  });

  test('WebSocketMessage JSON conversion', () => {
    const message = new WebSocketMessage('hello', { address: '127.0.0.1', port: 0 });
    const toJSON = message.toJSON();
    const fromJSON = WebSocketMessage.fromJSON(toJSON);
    assert.deepEqual(fromJSON, message);
  });

  test('WebSocketMessage IPv6 sender', () => {
    const message = new WebSocketMessage('hello', { address: '::ffff:127.0.0.1', port: 0 });
    assert.equal(message.sender.address, '127.0.0.1');
  });
});
