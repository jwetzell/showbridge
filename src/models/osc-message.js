class OscMessage {
  constructor(oscMsg, sender) {
    this.address = oscMsg.address;
    this.args = oscMsg.args.map((arg) => arg.value);
    this.sender = sender;
  }

  getAddress() {
    return this.msg.address;
  }
  getArgs() {
    return this.msg.args.map((arg) => arg.value);
  }

  getMessage() {
    return msg;
  }

  toString() {
    return `${this.address} ${this.args.join(' ')}`;
  }
}
module.exports = OscMessage;
