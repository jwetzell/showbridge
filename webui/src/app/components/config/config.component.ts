import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfigFile } from 'src/app/models/config.models';
import { ObjectInfo } from 'src/app/models/form.model';
import { EventService } from 'src/app/services/event.service';
import { SchemaService } from 'src/app/services/schema.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
  standalone: false,
})
export class ConfigComponent {
  @Input() config!: ConfigFile;
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  pendingUpdate?: ConfigFile;
  selectedMessageType: ObjectInfo = this.schemaService.handlerTypes[0];

  messageAndProtocolTypes: ObjectInfo[];

  constructor(
    public schemaService: SchemaService,
    public eventService: EventService,
    public settingsService: SettingsService
  ) {
    this.messageAndProtocolTypes = [];

    this.schemaService.handlerTypes.forEach((handlerInfo) => {
      if (this.messageAndProtocolTypes.find((objectInfo) => objectInfo.type === handlerInfo.type) === undefined) {
        this.messageAndProtocolTypes.push(handlerInfo);
      }
    });
    this.schemaService.protocolTypes.forEach((protocolInfo) => {
      if (this.messageAndProtocolTypes.find((objectInfo) => objectInfo.type === protocolInfo.type) === undefined) {
        this.messageAndProtocolTypes.push(protocolInfo);
      }
    });
  }

  handlerUpdate(type: string) {
    if (this.config.handlers[type] === undefined) {
      this.config.handlers[type] = {
        triggers: [],
      };
    }
    this.updated.emit(true);
  }

  protocolUpdate(type: string) {
    if (this.config.protocols[type] === undefined) {
      this.config.protocols[type] = {
        params: {},
      };
    }
    this.updated.emit(true);
  }

  selectMessageType(messageType: ObjectInfo) {
    this.selectedMessageType = messageType;
  }
}
