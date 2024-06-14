import { Response } from 'express';
type HTTPSender = {
  protocol: 'tcp';
  address: string;
};

class HTTPMessage {
  msg: any;
  response: Response;
  sender: HTTPSender;

  constructor(msg, response: Response) {
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

  get originalUrl(): string {
    return this.msg.originalUrl;
  }

  set originalUrl(value: string) {
    this.msg.originalUrl = value;
  }

  get baseUrl(): string {
    return this.msg.baseUrl;
  }

  set baseUrl(value: string) {
    this.msg.baseUrl = value;
  }

  get path(): string {
    return this.msg.path;
  }

  set path(value: string) {
    this.msg.path = value;
  }

  get body() {
    return this.msg.body;
  }

  set body(value) {
    this.msg.body = value;
  }

  get method(): string {
    return this.msg.method;
  }

  set method(value: string) {
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
    return new HTTPMessage(json.msg, undefined);
  }
}
export default HTTPMessage;
