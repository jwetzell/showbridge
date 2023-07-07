const osc = require('osc-min');
const { logger } = require('../../utils/helper');
class OSCMessage {
  constructor(msg, sender) {
    this.msg = msg;
    this.msg.args = this.msg.args.map((arg) => arg.value);
    this.sender = sender;
  }

  toString() {
    return `${this.address} ${this.args.join(' ')}`;
  }

  get address() {
    return this.msg.address;
  }

  set address(address) {
    this.msg.address = address;
  }

  get addressParts() {
    return this.address.split('/').splice(1);
  }

  get args() {
    return this.msg.args;
  }

  set args(args) {
    this.msg.args = args;
  }

  get bytes() {
    return Uint8Array.from(osc.toBuffer(this.msg));
  }
}
module.exports = OSCMessage;
