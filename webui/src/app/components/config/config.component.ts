import { Component, EventEmitter, Input, Output } from '@angular/core';
import { map } from 'rxjs';
import { ConfigFile } from 'src/app/models/config.models';
import { ObjectInfo } from 'src/app/models/form.model';
import { EventService } from 'src/app/services/event.service';
import { SchemaService } from 'src/app/services/schema.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent {
  @Input() config!: ConfigFile;
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  pendingUpdate?: ConfigFile;
  selectedProtocol: ObjectInfo = this.schemaService.protocolTypes[0];

  enabledProtocols: string[];
  constructor(
    public schemaService: SchemaService,
    public eventService: EventService,
    public settingsService: SettingsService
  ) {
    this.enabledProtocols = this.schemaService.protocolTypes.map((protocolInfo) => protocolInfo.type);

    this.eventService.protocolStatus$
      .pipe(
        map((protocolStatus) => {
          return Object.entries(protocolStatus.data)
            .filter(([key, value]) => {
              return value.enabled;
            })
            .map(([key, value]) => {
              return key;
            });
        })
      )
      .subscribe((protocolTypes) => {
        this.enabledProtocols = protocolTypes;
      });
  }

  protocolUpdate(type: string) {
    if (this.config[type] === undefined) {
      this.config[type] = {
        triggers: [],
      };
    }
    this.updated.emit(true);
  }

  selectProtocolType(protocol: ObjectInfo) {
    this.selectedProtocol = protocol;
  }
}
