class UDPMessage {
  constructor(msg, sender) {
    this.msg = msg;

    this.sender = sender;
    if (this.sender?.address.substr(0, 7) === '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  get messageType() {
    return 'udp';
  }

  get bytes() {
    return Uint8Array.from(this.msg);
  }

  set bytes(bytes) {
    this.msg = bytes;
  }

  get string() {
    return this.msg.toString();
  }

  set string(string) {
    this.msg = Buffer.from(string);
  }

  toString() {
    return this.string;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      ...this,
    };
  }

  static fromJSON(json) {
    return new UDPMessage(json.msg, json.sender);
  }
}
module.exports = UDPMessage;
