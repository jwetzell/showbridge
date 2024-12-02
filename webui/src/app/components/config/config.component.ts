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
    standalone: false
})
export class ConfigComponent {
  @Input() config!: ConfigFile;
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  pendingUpdate?: ConfigFile;
  selectedMessageType: ObjectInfo = this.schemaService.messageTypes[0];

  messageTypes: string[];
  constructor(
    public schemaService: SchemaService,
    public eventService: EventService,
    public settingsService: SettingsService
  ) {
    this.messageTypes = this.schemaService.messageTypes.map((protocolInfo) => protocolInfo.type);
  }

  protocolUpdate(type: string) {
    if (this.config[type] === undefined) {
      this.config[type] = {
        triggers: [],
      };
    }
    this.updated.emit(true);
  }

  selectMessageType(messageType: ObjectInfo) {
    this.selectedMessageType = messageType;
  }
}
