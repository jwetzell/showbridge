#!/usr/bin/env node
const { logger } = require('../lib/utils');
const { Config, Router } = require('../lib');
const { MIDIMessage, UDPMessage, TCPMessage, MQTTMessage, WebSocketMessage, HTTPMessage } = require('../lib/messages');

const testConfig = require('./test.json');

logger.info(`app: loading test config`);
const config = new Config(testConfig);
const router = new Router(config);

const testMessages = [
  // MIDI
  new MIDIMessage([0x80, 60, 100], 'test'),
  new MIDIMessage([0x90, 60, 100], 'test'),
  // new MIDIMessage([0xa0, 60, 100], 'test'),
  new MIDIMessage([0xb0, 60, 100], 'test'),
  new MIDIMessage([0xc0, 60, 100], 'test'),
  // new MIDIMessage([0xd0, 60, 100], 'test'),
  // new MIDIMessage([0xe0, 60, 100], 'test'),

  // UDP
  new UDPMessage('string', { address: '127.0.0.1', port: 0 }),
  new UDPMessage(Buffer.from('buffer'), { address: '127.0.0.1', port: 0 }),

  // TCP
  new TCPMessage('string', { address: '127.0.0.1', port: 0 }),
  new TCPMessage(Buffer.from('buffer'), { address: '127.0.0.1', port: 0 }),

  // MQTT
  new MQTTMessage('hello', 'test'),
  new MQTTMessage(JSON.stringify({ hello: 'world' }), 'test'),

  // WebSocket
  new WebSocketMessage('hello', 'test'),
  new WebSocketMessage(JSON.stringify({ hello: 'world' }), 'test'),

  // HTTP
  new HTTPMessage({
    originalUrl: '/test',
    baseUrl: '/test',
    body: '',
    path: '/test',
    headers: {},
    connection: {
      remoteAddress: '127.0.0.1',
    },
  }),
];

testMessages.forEach((message) => {
  router.processMessage(message);
});
