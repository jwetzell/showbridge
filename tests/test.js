#!/usr/bin/env node

const testConfig = require('./test.json');
const schema = require('../schema/config.schema.json');

import('../lib/index.js').then(({ Config, Router, Utils, Messages }) => {
  const logger = Utils.logger;

  const { OSCMessage, MIDIMessage, UDPMessage, TCPMessage, MQTTMessage, WebSocketMessage, HTTPMessage } = Messages;

  logger.info(`test: loading test config`);
  const config = new Config(testConfig, schema);
  const router = new Router(config);

  const testMessages = [
    // MIDI
    new MIDIMessage([0x80, 60, 100], 'test'),
    new MIDIMessage([0x90, 60, 100], 'test'),
    new MIDIMessage([0xa0, 60, 100], 'test'),
    new MIDIMessage([0xb0, 60, 100], 'test'),
    new MIDIMessage([0xc0, 60, 100], 'test'),
    new MIDIMessage([0xd0, 60, 100], 'test'),
    new MIDIMessage([0xe0, 60, 100], 'test'),

    // UDP
    new UDPMessage('string udp message', { address: '127.0.0.1', port: 0 }),
    new UDPMessage(Buffer.from('buffer udp message'), { address: '127.0.0.1', port: 0 }),

    // TCP
    new TCPMessage('string tcp message', { address: '127.0.0.1', port: 0 }),
    new TCPMessage(Buffer.from('buffer tcp message'), { address: '127.0.0.1', port: 0 }),

    // OSC
    new OSCMessage(
      {
        address: '/test',
        args: [],
      },
      { address: '127.0.0.1', port: 0 }
    ),

    // MQTT
    new MQTTMessage('simple string mqtt message', 'test'),
    new MQTTMessage(JSON.stringify({ data: 'object mqtt message' }), 'test'),

    // WebSocket
    new WebSocketMessage('simple string websocket message', 'test'),
    new WebSocketMessage(JSON.stringify({ data: 'object websocket message' }), 'test'),

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
});
