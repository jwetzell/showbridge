class WebSocketMessage {
  constructor(msgBuffer, connection) {
    try {
      this.msg = JSON.parse(msgBuffer.toString());
    } catch (error) {
      this.msg = msgBuffer.toString();
    }

    // extract some key request properties
    this.sender = {
      protocol: 'tcp',
      address: connection.remoteAddress,
    };
    if (this.sender.address.substr(0, 7) == '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  toString() {
    return `${this.msg}`;
  }
}
module.exports = WebSocketMessage;
