import assert from 'node:assert';
import { describe, test } from 'node:test';
import UDPMessage from '../../dist/lib/messages/udp-message.js';

describe('UDPMessage', () => {
  test('create UDPMessage', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.notEqual(message, undefined);
    assert.equal(message.messageType, 'udp');
  });

  test('string UDPMessage', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.notEqual(message, undefined);
    assert.equal(message.string, 'test');
    assert.equal(message.toString(), 'test');
    assert.deepEqual(message.bytes, Buffer.from('test'));
  });

  test('UDPMessage JSON conversion', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });

    const toJSON = message.toJSON();

    const fromJSON = UDPMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('UDPMessage IPv6 sender', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '::ffff:127.0.0.1', port: 0 });
    assert.equal(message.sender.address, '127.0.0.1');
  });

  test('UDPMessage string setter', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.equal(message.string, 'test');
    message.string = 'changed';
    assert.equal(message.string, 'changed');
  });

  test('UDPMessage bytes setter', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.deepEqual(message.bytes, Buffer.from('test'));
    message.bytes = Buffer.from('changed');
    assert.deepEqual(message.bytes, Buffer.from('changed'));
  });
});

describe('UDPMessage', () => {
  test('create UDPMessage', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.notEqual(message, undefined);
    assert.equal(message.messageType, 'udp');
  });

  test('string UDPMessage', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.notEqual(message, undefined);
    assert.equal(message.string, 'test');
    assert.equal(message.toString(), 'test');
    assert.deepEqual(message.bytes, Buffer.from('test'));
  });

  test('UDPMessage JSON conversion', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });

    const toJSON = message.toJSON();

    const fromJSON = UDPMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('UDPMessage IPv6 sender', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '::ffff:127.0.0.1', port: 0 });
    assert.equal(message.sender.address, '127.0.0.1');
  });

  test('UDPMessage string setter', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.equal(message.string, 'test');
    message.string = 'changed';
    assert.equal(message.string, 'changed');
  });

  test('UDPMessage bytes setter', () => {
    const message = new UDPMessage(Buffer.from('test'), { address: '127.0.0.1', port: 0 });
    assert.deepEqual(message.bytes, Buffer.from('test'));
    message.bytes = Buffer.from('changed');
    assert.deepEqual(message.bytes, Buffer.from('changed'));
  });
});
