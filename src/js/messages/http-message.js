class HTTPMessage {
  constructor(msg) {
    this.msg = msg;

    this.sender = {
      protocol: 'tcp',
      address: msg.headers['x-forwarded-for'] || msg.connection.remoteAddress,
    };
    if (this.sender?.address?.substr(0, 7) === '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  get messageType() {
    return 'http';
  }

  get originalUrl() {
    return this.msg.originalUrl;
  }

  get baseUrl() {
    return this.msg.baseUrl;
  }

  get path() {
    return this.msg.path;
  }

  get body() {
    return this.msg.body;
  }

  toString() {
    return `${this.originalUrl}`;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      msg: {
        originalUrl: this.originalUrl,
        baseUrl: this.baseUrl,
        body: this.body,
        path: this.path,
        headers: this.msg.headers,
        connection: {
          remoteAddress: this.msg.connection.remoteAddress,
        },
      },
    };
  }

  static fromJSON(json) {
    return new HTTPMessage(json.msg);
  }
}
module.exports = HTTPMessage;
