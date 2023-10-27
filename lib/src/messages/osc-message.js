import { has } from 'lodash-es';
import osc from 'osc-min';

class OSCMessage {
  constructor(msg, sender) {
    this.msg = msg;
    this.msg.args = this.msg.args.map((arg) => {
      if (has(arg, 'value')) {
        return arg.value;
      }
      return arg;
    });
    this.sender = sender;
  }

  get messageType() {
    return 'osc';
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

  toString() {
    return `${this.address} ${this.args.join(' ')}`;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      msg: this.msg,
      sender: this.sender,
    };
  }

  static fromJSON(json) {
    return new OSCMessage(json.msg, json.sender);
  }
}
export default OSCMessage;
