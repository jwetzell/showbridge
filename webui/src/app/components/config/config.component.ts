import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ConfigFile } from 'src/app/models/config.models';
import { ObjectInfo } from 'src/app/models/form.model';
import { SchemaService } from 'src/app/services/schema.service';
import { ProtocolComponent } from '../protocol/protocol.component';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent {
  @Input() config!: ConfigFile;
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  @ViewChild('protocolComponent') protocolComponent?: ProtocolComponent;
  pendingUpdate?: ConfigFile;
  selectedProtocol: ObjectInfo = this.schemaService.protocolTypes[0];

  constructor(public schemaService: SchemaService) {}

  protocolUpdate() {
    this.updated.emit(true);
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
