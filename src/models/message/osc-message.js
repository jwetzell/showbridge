const osc = require('osc-min');
class OSCMessage {
  constructor(oscMsg, sender) {
    this.msg = oscMsg;
    this.address = oscMsg.address;
    this.addressParts = this.address.split('/').splice(1);
    this.args = oscMsg.args.map((arg) => arg.value);
    this.sender = sender;
  }

  toString() {
    return `${this.address} ${this.args.join(' ')}`;
  }
  getBuffer() {
    return osc.toBuffer(this.msg);
  }

  get bytes() {
    return Uint8Array.from(this.getBuffer());
  }
}
module.exports = OSCMessage;
