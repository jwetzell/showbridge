class UDPMessage {
  constructor(msg, sender) {
    this.msg = msg;
    this.sender = sender;
    if (this.sender.address.substr(0, 7) == '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  toString() {
    return `${this.msg}`;
  }

  get bytes() {
    return Uint8Array.from(this.msg);
  }
}
module.exports = UDPMessage;
