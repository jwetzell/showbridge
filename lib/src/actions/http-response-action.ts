import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { HTTPMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

export type ContentType =
  | 'text/plain'
  | 'text/html'
  | 'text/csv'
  | 'application/json'
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'audio/wav'
  | 'audio/webm'
  | 'video/mp4'
  | 'video/mpeg'
  | 'video/webm';

type HTTPResponseActionParams = FileBodyParams | StringBodyParams;

type FileBodyParams = {
  contentType?: ContentType;
  path?: string;
};

type StringBodyParams = {
  contentType?: ContentType;
  path?: string;
};

class HTTPResponseAction extends Action<HTTPResponseActionParams> {
  _run(_msg: HTTPMessage, vars) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      if (msg.response) {
        if (resolvedParams.contentType) {
          msg.response.setHeader('content-type', resolvedParams.contentType);
        }

        if ('body' in resolvedParams) {
          msg.response.status(200).send(resolvedParams.body);
        } else if ('path' in resolvedParams) {
          const resolvedPath = path.resolve(resolvedParams.path);
          if (existsSync(resolvedPath)) {
            const fileData = readFileSync(resolvedPath);
            msg.response.status(200).send(fileData);
          } else {
            msg.response.status(404).send();
          }
        }
      } else {
        logger.error('action: http-response action called from a non http context');
      }
    } catch (error) {
      logger.error(`action: problem executing http-response action - ${error}`);
      if (msg.response) {
        msg.response.status(500).send(error);
      }
    }
    this.emit('finished');
  }
}
export default HTTPResponseAction;
