import { Component, EventEmitter, Input, Output } from '@angular/core';
import { cloneDeep, has, merge } from 'lodash';
import { ConfigFileSchema, ProtocolConfiguration } from 'src/app/models/config.models';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent {
  @Input() config!: ConfigFileSchema;
  @Output() updated: EventEmitter<ConfigFileSchema> = new EventEmitter<ConfigFileSchema>();

  pendingUpdate?: ConfigFileSchema;
  protocols = ['http', 'ws', 'osc', 'tcp', 'udp', 'midi', 'mqtt', 'cloud'];

  protocolUpdate(protocolType: string, protocol: ProtocolConfiguration) {
    if (has(this.config, protocolType)) {
      merge(this.config[protocolType], protocol);
      this.pendingUpdate = cloneDeep(this.config);
      this.updated.emit(this.pendingUpdate);
    }
  }
}
