const ForwardAction = require('./forward-action');
const HttpAction = require('./http-action');
const LogAction = require('./log-action');
const MIDIOutputAction = require('./midi-output-action');
const MQTTOutputAction = require('./mqtt-output-action');
const OSCOutputAction = require('./osc-output-action');
const ShellAction = require('./shell-action');
const StoreAction = require('./store-action');
const TCPOutputAction = require('./tcp-output-action');
const UDPOutputAction = require('./udp-output-action');
const CloudOutputAction = require('./cloud-output-action');

module.exports = {
  ForwardAction,
  HttpAction,
  LogAction,
  MIDIOutputAction,
  MQTTOutputAction,
  OSCOutputAction,
  ShellAction,
  StoreAction,
  TCPOutputAction,
  UDPOutputAction,
  CloudOutputAction,
};
