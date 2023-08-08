import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProtocolConfiguration } from 'src/app/models/config.models';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-protocol-form',
  templateUrl: './protocol-form.component.html',
  styleUrls: ['./protocol-form.component.css'],
})
export class ProtocolFormComponent implements OnInit {
  @Input() type?: string;
  @Input() data?: ProtocolConfiguration;
  @Output() updated: EventEmitter<ProtocolConfiguration> = new EventEmitter<ProtocolConfiguration>();

  schema: any;

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    if (this.type) {
      this.schema = this.schemaService.getSchemaForProtocol(this.type);
    }
  }

  paramsUpdated(params: any) {
    console.log('protocol params updated');
    this.updated.emit({ ...this.data, params });
  }
}
