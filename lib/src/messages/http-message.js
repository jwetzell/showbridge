class HTTPMessage {
  constructor(msg, response) {
    this.msg = msg;

    this.response = response;

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

  set originalUrl(value) {
    this.msg.originalUrl = value;
  }

  get baseUrl() {
    return this.msg.baseUrl;
  }

  set baseUrl(value) {
    this.msg.baseUrl = value;
  }

  get path() {
    return this.msg.path;
  }

  set path(value) {
    this.msg.path = value;
  }

  get body() {
    return this.msg.body;
  }

  set body(value) {
    this.msg.body = value;
  }

  get method() {
    return this.msg.method;
  }

  set method(value) {
    this.msg.method = value;
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
        method: this.method,
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
export default HTTPMessage;
