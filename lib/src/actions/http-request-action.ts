import { Message } from '../messages/index.js';
import { RouterProtocols, RouterVars } from '../router.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

type HTTPRequestActionParams = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  contentType?: string;
  body?: string;
};

class HTTPRequestAction extends Action<HTTPRequestActionParams> {
  _run(_msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    // TODO(jwetzell): add other http things like query parameters though they can just be included in the url field
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      if (resolvedParams.url && resolvedParams.url !== '') {
        protocols.http.send(resolvedParams.url, resolvedParams.method, resolvedParams.body, resolvedParams.contentType);
      } else {
        logger.error('action: url is empty');
      }
    } catch (error) {
      logger.error(`action: problem executing http action - ${error}`);
    }
    this.emit('finished');
  }
}
export default HTTPRequestAction;
