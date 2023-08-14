import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { cloneDeep, has, merge } from 'lodash';
import { ConfigFileSchema, ProtocolConfiguration } from 'src/app/models/config.models';
import { ProtocolComponent } from '../protocol/protocol.component';
import { SchemaService } from 'src/app/services/schema.service';
import { ObjectInfo } from 'src/app/models/form.model';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent {
  @Input() config!: ConfigFileSchema;
  @Output() updated: EventEmitter<ConfigFileSchema> = new EventEmitter<ConfigFileSchema>();
  @ViewChild('protocolComponent') protocolComponent?: ProtocolComponent;
  pendingUpdate?: ConfigFileSchema;
  selectedProtocol: ObjectInfo = this.schemaService.protocolTypes[0];

  constructor(public schemaService: SchemaService) {}

  protocolUpdate(protocolType: string, protocol: ProtocolConfiguration) {
    if (has(this.config, protocolType)) {
      merge(this.config[protocolType], protocol);
      this.pendingUpdate = cloneDeep(this.config);
      this.updated.emit(this.pendingUpdate);
    }
  }

  selectProtocolType(protocol: ObjectInfo) {
    this.selectedProtocol = protocol;
  }

  openProtocolSettingsDialog() {
    if (this.protocolComponent) {
      this.protocolComponent.openSettings.next(true);
    }
  }
}
