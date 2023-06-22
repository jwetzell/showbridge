class HTTPMessage {
  constructor(request) {
    this.msg = request;

    // extract some key request properties
    this.originalUrl = request.originalUrl;
    this.baseUrl = request.baseUrl;
    this.path = request.path;
    this.body = request.body;

    this.sender = {
      protocol: 'tcp',
      address: request.headers['x-forwarded-for'] || request.connection.remoteAddress,
    };
    if (this.sender.address.substr(0, 7) == '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  toString() {
    return `${this.msg.originalUrl}`;
  }
}
module.exports = HTTPMessage;
