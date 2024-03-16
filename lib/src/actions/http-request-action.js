import { logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class HTTPRequestAction extends Action {
  _run(_msg, vars, protocols) {
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
