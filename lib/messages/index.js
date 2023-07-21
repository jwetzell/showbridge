const MIDIMessage = require('./midi-message');
const UDPMessage = require('./udp-message');
const TCPMessage = require('./tcp-message');
const OSCMessage = require('./osc-message');
const MQTTMessage = require('./mqtt-message');
const WebSocketMessage = require('./websocket-message');
const HTTPMessage = require('./http-message');

module.exports = {
  MIDIMessage,
  UDPMessage,
  TCPMessage,
  OSCMessage,
  MQTTMessage,
  WebSocketMessage,
  HTTPMessage,
};
