import assert from 'node:assert';
import { describe, test } from 'node:test';
import TCPMessage from '../../src/messages/tcp-message.js';

describe('TCPMessage', () => {
  test('create TCPMessage', () => {
    const message = new TCPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.notEqual(message, undefined);
    assert.equal(message.messageType, 'tcp');
  });

  test('string TCPMessage', () => {
    const message = new TCPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.notEqual(message, undefined);
    assert.equal(message.string, 'test');
    assert.equal(message.toString(), 'test');
    assert.deepEqual(message.bytes, Buffer.from('test'));
  });

  test('TCPMessage JSON conversion', () => {
    const message = new TCPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });

    const toJSON = message.toJSON();

    const fromJSON = TCPMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('TCPMessage IPv6 sender', () => {
    const message = new TCPMessage(Buffer.from('test'), { address: '::ffff:127.0.0.1', port: 0 });
    assert.equal(message.sender.address, '127.0.0.1');
  });

  test('TCPMessage string setter', () => {
    const message = new TCPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.equal(message.string, 'test');
    message.string = 'changed';
    assert.equal(message.string, 'changed');
  });

  test('TCPMessage bytes setter', () => {
    const message = new TCPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.deepEqual(message.bytes, Buffer.from('test'));
    message.bytes = Buffer.from('changed');
    assert.deepEqual(message.bytes, Buffer.from('changed'));
  });
});
