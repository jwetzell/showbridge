import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, filter, timer } from 'rxjs';
import {
  ActionEventData,
  MessageEventData,
  ProtocolStatusEventData,
  TransformEventData,
  TriggerEventData,
} from '../models/events.model';
import { SettingsService } from './settings.service';
@Injectable({
  providedIn: 'root',
})
export class EventService {
  websocketUrl?: URL;
  socket?: WebSocket;

  status$: BehaviorSubject<string> = new BehaviorSubject<string>('closed');

  private messageInEvents$: Subject<MessageEventData> = new Subject<MessageEventData>();
  private triggerEvents$: Subject<TriggerEventData> = new Subject<TriggerEventData>();
  private actionEvents$: Subject<ActionEventData> = new Subject<ActionEventData>();
  private transformEvents$: Subject<TransformEventData> = new Subject<TransformEventData>();
  public protocolStatus$: BehaviorSubject<ProtocolStatusEventData> = new BehaviorSubject<ProtocolStatusEventData>({
    eventName: 'protocolStatus',
    data: {},
  });

  private protocolStatusSubscription?: Subscription;

  constructor(private settingsService: SettingsService) {
    settingsService.websocketUrl.subscribe((url) => {
      console.log(`websocket url: ${url}`);
      this.websocketUrl = url;
      this.reload();
    });
  }

  reload() {
    try {
      if (this.websocketUrl) {
        this.socket = new WebSocket(this.websocketUrl, 'webui');
        this.socket.onopen = (ev) => {
          this.status$.next('open');
          this.protocolStatusSubscription = timer(0, 5000).subscribe(() => {
            if (this.socket && this.socket.readyState === this.socket.OPEN) {
              this.socket.send(
                JSON.stringify({
                  eventName: 'getProtocolStatus',
                })
              );
            }
          });
        };

        this.socket.onclose = (ev) => {
          if (this.protocolStatusSubscription) {
            this.protocolStatusSubscription.unsubscribe();
          }
          this.status$.next('closed');

          // TODO(jwetzell): this could probably be better done
          setTimeout(() => {
            if (!this.settingsService.isDummySite) {
              this.reload();
            }
          }, 2000);
        };

        this.socket.onerror = (ev) => {
          this.status$.next('error');
        };

        // NOTE(jwetzell): websocket messages from router to webui
        this.socket.onmessage = (message: MessageEvent) => {
          const messageObj = JSON.parse(message.data);
          console.log(messageObj);
          switch (messageObj.eventName) {
            case 'messageIn':
              this.messageInEvents$.next(messageObj);
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
            case 'protocolStatus':
              this.protocolStatus$.next(messageObj);
              break;
            default:
              console.log(`unhandled websocket message type = ${messageObj.eventName}`);
              console.log(messageObj);
              break;
          }
        };
      }
    } catch (error) {
      console.error('problem connecting to ws');
      console.error(error);
    }
  }

  getTriggerEventsForPath(path: string) {
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
