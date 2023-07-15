const Action = require('./action');
const { logger, resolveTemplatedProperty } = require('../utils/helper');

class HTTPAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    // TODO(jwetzell): add other http things like query parameters though they can just be included in the url field
    try {
      const url = resolveTemplatedProperty(this.params, 'url', { msg, vars });
      const body = resolveTemplatedProperty(this.params, 'body', { msg, vars });

      if (url && url !== '') {
        servers.http.send(url, this.params.method, body, this.params.contentType);
      } else {
        logger.error('action: url is empty');
      }
    } catch (error) {
      logger.error(`action: problem executing http action - ${error}`);
    }
  }
}
module.exports = HTTPAction;
