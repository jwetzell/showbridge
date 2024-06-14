class MQTTMessage {
  private msg: string | object;
  topic: string;
  processedPayload: string | object;

  constructor(msg: Buffer, topic: string) {
    this.payload = msg.toString();
    this.topic = topic;
  }

  processPayload() {
    try {
      this.processedPayload = JSON.parse(this.msg.toString());
    } catch (error) {
      this.processedPayload = this.msg;
    }
  }

  get messageType() {
    return 'mqtt';
  }

  get payload() {
    return this.processedPayload;
  }

  set payload(value) {
    this.msg = value;
    this.processPayload();
  }

  get bytes() {
    return Buffer.from(this.msg.toString());
  }

  toString() {
    return `${this.topic} - ${this.msg}`;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      msg: this.msg,
      topic: this.topic,
    };
  }

  static fromJSON(json) {
    return new MQTTMessage(json.msg, json.topic);
  }
}
export default MQTTMessage;
