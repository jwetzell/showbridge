import assert from 'node:assert';
import { describe, test } from 'node:test';
import MQTTMessage from '../../src/messages/mqtt-message.js';

describe('MQTTMessage', () => {
  test('create MQTTMessage', () => {
    const message = new MQTTMessage('hello', 'test');
    assert.equal(message.messageType, 'mqtt');
  });

  test('string MQTTMessage payload', () => {
    const payload = 'hello';
    const topic = 'test';
    const message = new MQTTMessage(payload, topic);
    assert.equal(typeof message.payload, 'string');
    assert.equal(message.payload, payload);
    assert.deepEqual(message.bytes, Buffer.from(payload));
    assert.deepEqual(message.toJSON(), {
      messageType: 'mqtt',
      msg: payload,
      topic: topic,
    });
  });

  test('JSON MQTTMessage payload', () => {
    const payload = JSON.stringify({ key: 'hello' });
    const topic = 'test';

    const message = new MQTTMessage(payload, topic);
    assert.equal(typeof message.payload, 'object');
    assert.deepEqual(message.payload, JSON.parse(payload));
    assert.deepEqual(message.bytes, Buffer.from(payload));
    assert.deepEqual(message.toJSON(), {
      messageType: 'mqtt',
      msg: payload,
      topic: topic,
    });
  });

  test('MQTTMessage JSON conversion', () => {
    const message = new MQTTMessage('hello', 'test');
    const toJSON = message.toJSON();
    const fromJSON = MQTTMessage.fromJSON(toJSON);
    assert.deepEqual(fromJSON, message);
  });
});
