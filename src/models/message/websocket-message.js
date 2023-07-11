class WebSocketMessage {
  constructor(msg, connection) {
    this.msg = msg;

    // extract some key request properties
    this.sender = {
      protocol: 'tcp',
      address: connection.remoteAddress,
    };
    if (this.sender.address.substr(0, 7) === '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  get messageType() {
    return 'ws';
  }

  get payload() {
    try {
      return JSON.parse(this.msg.toString());
    } catch (error) {
      return this.msg.toString();
    }
  }

  set payload(payload) {
    this.msg = Buffer.from(payload);
  }

  toString() {
    if (typeof this.payload === 'object') {
      return JSON.stringify(this.payload);
    }
    return `${this.payload}`;
  }
}
module.exports = WebSocketMessage;
