import HTTPMessage from './http-message.js';
import MIDIMessage from './midi-message.js';
import MQTTMessage from './mqtt-message.js';
import OSCMessage from './osc-message.js';
import TCPMessage from './tcp-message.js';
import UDPMessage from './udp-message.js';
import WebSocketMessage from './websocket-message.js';

export { HTTPMessage, MIDIMessage, MQTTMessage, OSCMessage, TCPMessage, UDPMessage, WebSocketMessage };

export const MessageTypeClassMap = {
  http: HTTPMessage,
  midi: MIDIMessage,
  mqtt: MQTTMessage,
  osc: OSCMessage,
  tcp: TCPMessage,
  udp: UDPMessage,
  ws: WebSocketMessage,
};
