const superagent = require('superagent');
const Action = require('./action');
const { logger, resolveTemplatedProperty } = require('../utils/helper');

class HTTPAction extends Action {
  do(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    // TODO(jwetzell): add other http things like query parameters though they can just be included in the url field
    try {
      const url = resolveTemplatedProperty(this.params, 'url', { msg, vars });
      const body = resolveTemplatedProperty(this.params, 'body', { msg, vars });

      if (url && url !== '') {
        const request = superagent(this.params.method, url);
        if (this.params.contentType !== undefined) {
          request.type(this.params.contentType);
        }

        if (body !== '') {
          request.send(body);
        }

        request.end((error) => {
          if (error) {
            logger.error(`action: problem executing http action - ${error}`);
          }
        });
      } else {
        logger.error('action: url is empty');
      }
    } catch (error) {
      logger.error(`action: problem executing http action - ${error}`);
    }
  }
}
module.exports = HTTPAction;
