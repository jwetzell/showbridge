class OscMessage {
  constructor(oscMsg, sender) {
    this.address = oscMsg.address;
    this.addressParts = this.address.split('/').splice(1);
    this.args = oscMsg.args.map((arg) => arg.value);
    this.sender = sender;
  }

  toString() {
    return `${this.address} ${this.args.join(' ')}`;
  }
}
module.exports = OscMessage;
