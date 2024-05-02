import assert from 'node:assert';
import { describe, test } from 'node:test';
import OSCMessage from '../../src/messages/osc-message.js';

describe('OSCMessage', () => {
  test('create OSCMessage', () => {
    const message = new OSCMessage({ args: [1, 2, 3], address: '/hello' }, { address: '127.0.0.1', port: 0 });
    assert.notEqual(message, undefined);
    assert.equal(message.messageType, 'osc');
  });

  test('create OSCMessage with osc-min args', () => {
    const message = new OSCMessage(
      { args: [{ type: 's', value: 1 }], address: '/hello' },
      { address: '127.0.0.1', port: 0 }
    );

    assert.notEqual(message, undefined);
    assert.equal(message.messageType, 'osc');
    assert.deepEqual(message.args, [1]);
  });

  test('OSCMessage IPv6 sender', () => {
    const message = new OSCMessage({ args: [], address: '/hello' }, { address: '::ffff:127.0.0.1', port: 0 });
    assert.equal(message.sender.address, '127.0.0.1');
  });

  test('OSCMessage address getter', () => {
    const message = new OSCMessage({ args: [], address: '/hello' }, { address: '127.0.0.1', port: 0 });
    assert.equal(message.address, '/hello');
  });

  test('OSCMessage addressParts getter', () => {
    const message = new OSCMessage({ args: [], address: '/hello' }, { address: '127.0.0.1', port: 0 });
    assert.deepEqual(message.addressParts, ['hello']);
  });

  test('OSCMessage address setter', () => {
    const message = new OSCMessage({ args: [], address: '/hello' }, { address: '127.0.0.1', port: 0 });
    message.address = '/changed';
    assert.equal(message.address, '/changed');
  });

  test('OSCMessage args getter', () => {
    const message = new OSCMessage({ args: [1, 2, 3], address: '/hello' }, { address: '127.0.0.1', port: 0 });
    assert.deepEqual(message.args, [1, 2, 3]);
  });

  test('OSCMessage args setter', () => {
    const message = new OSCMessage({ args: [1, 2, 3], address: '/hello' }, { address: '127.0.0.1', port: 0 });
    message.args = ['changed'];
    assert.deepEqual(message.args, ['changed']);
  });

  test('OSCMessage JSON conversion', () => {
    const message = new OSCMessage({ args: [1, 2, 3], address: '/hello' }, { address: '127.0.0.1', port: 0 });

    const toJSON = message.toJSON();

    const fromJSON = OSCMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });
});
