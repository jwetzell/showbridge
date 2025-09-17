import CloudProtocol from './cloud-protocol.js';
import HTTPProtocol from './http-protocol.js';
import MIDIProtocol from './midi-protocol.js';
import MQTTProtocol from './mqtt-protocol.js';
import PSNProtocol from './psn-protocol.js';
import TCPProtocol from './tcp-protocol.js';
import UDPProtocol from './udp-protocol.js';

export { CloudProtocol, HTTPProtocol, MIDIProtocol, MQTTProtocol, PSNProtocol, TCPProtocol, UDPProtocol };

export const ProtocolTypeClassMap = {
  cloud: CloudProtocol,
  http: HTTPProtocol,
  midi: MIDIProtocol,
  mqtt: MQTTProtocol,
  tcp: TCPProtocol,
  udp: UDPProtocol,
  psn: PSNProtocol,
};
