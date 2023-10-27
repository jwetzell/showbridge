class WebSocketMessage {
  constructor(msg, sender) {
    this.payload = msg.toString();
    this.sender = sender;

    if (this.sender?.address?.substr(0, 7) === '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  processPayload() {
    try {
      this.processedPayload = JSON.parse(this.msg);
    } catch (error) {
      this.processedPayload = this.msg;
    }
  }

  get messageType() {
    return 'ws';
  }

  get payload() {
    return this.processedPayload;
  }

  set payload(payload) {
    this.msg = payload;
    this.processPayload();
  }

  get bytes() {
    return Buffer.from(this.msg);
  }

  toString() {
    return this.msg;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      msg: this.msg,
      sender: this.sender,
    };
  }

  static fromJSON(json) {
    return new WebSocketMessage(json.msg, json.sender);
  }
}
export default WebSocketMessage;
