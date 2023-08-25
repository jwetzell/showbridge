import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfigFile } from 'src/app/models/config.models';
import { ObjectInfo } from 'src/app/models/form.model';
import { SchemaService } from 'src/app/services/schema.service';

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

  constructor(public schemaService: SchemaService) {}

  protocolUpdate() {
    console.log('config updated');
    console.log(this.config);
    this.updated.emit(true);
  }

  selectProtocolType(protocol: ObjectInfo) {
    this.selectedProtocol = protocol;
  }
}
