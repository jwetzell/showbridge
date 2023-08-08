import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfigFileSchema, ProtocolConfiguration } from 'src/app/models/config.models';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent {
  @Input() config!: ConfigFileSchema;
  @Output() updated: EventEmitter<ConfigFileSchema> = new EventEmitter<ConfigFileSchema>();

  protocols = ['http', 'ws', 'osc', 'tcp', 'udp', 'midi', 'mqtt', 'cloud'];

  protocolUpdate(protocol: string, newProtocolConfig: ProtocolConfiguration) {
    const newConfig = JSON.parse(JSON.stringify(this.config));
    newConfig[protocol] = newProtocolConfig;
    console.log(newConfig);
    this.updated.emit(newConfig);
  }
}
