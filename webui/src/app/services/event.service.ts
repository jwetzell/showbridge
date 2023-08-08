import { Injectable } from '@angular/core';
import { Subject, filter } from 'rxjs';
import { ActionEventData, MessageEventData, TransformEventData, TriggerEventData } from '../models/events.model';
@Injectable({
  providedIn: 'root',
})
export class EventService {
  baseUrl: string = `ws://${location.host}`;
  socket?: WebSocket;

  private messageEvents$: Subject<MessageEventData> = new Subject<MessageEventData>();
  private triggerEvents$: Subject<TriggerEventData> = new Subject<TriggerEventData>();
  private actionEvents$: Subject<ActionEventData> = new Subject<ActionEventData>();
  private transformEvents$: Subject<TransformEventData> = new Subject<TransformEventData>();

  constructor() {
    this.reload();
  }

  reload() {
    try {
      this.socket = new WebSocket(this.baseUrl, 'webui');
      // TODO (jwetzell): implement transform event messages in the actual router
      this.socket.onmessage = (message: MessageEvent) => {
        const messageObj = JSON.parse(message.data);
        switch (messageObj.eventType) {
          case 'message':
            this.messageEvents$.next(messageObj);
            break;
          case 'trigger':
            this.triggerEvents$.next(messageObj);
            break;
          case 'action':
            this.actionEvents$.next(messageObj);
            break;
          case 'transform':
            this.transformEvents$.next(messageObj);
            break;
          default:
            console.log(`unhandled websocket message type = ${messageObj.eventType}`);
            console.log(messageObj);
            break;
        }
      };
    } catch (error) {
      console.error(error);
    }
  }

  getTriggersForPath(path: string) {
    return this.triggerEvents$.pipe(
      filter((triggerEvent) => {
        return triggerEvent.data.path === path;
      })
    );
  }

  getActionEventsForPath(path: string) {
    return this.actionEvents$.pipe(
      filter((actionEvent) => {
        return actionEvent.data.path === path;
      })
    );
  }

  getTransformEventsForPath(path: string) {
    return this.transformEvents$.pipe(
      filter((transformEvent) => {
        return transformEvent.data.path === path;
      })
    );
  }
}
