class WebSocketMessage {
  constructor(msg, sender) {
    this.msg = msg;
    this.sender = sender;

    if (this.sender?.address?.substr(0, 7) === '::ffff:') {
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

  get bytes() {
    return this.msg;
  }

  toString() {
    if (typeof this.payload === 'object') {
      return JSON.stringify(this.payload);
    }
    return `${this.payload}`;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      ...this,
    };
  }

  static fromJSON(json) {
    return new WebSocketMessage(json.msg, json.sender);
  }
}
module.exports = WebSocketMessage;
