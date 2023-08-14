import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;

  schema?: any;

  hasSettings: boolean = false;

  constructor(
    private schemaService: SchemaService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.type) {
      this.schema = this.schemaService.getSchemaForProtocol(this.type);
      if (this.schema?.properties.params) {
        this.hasSettings = true;
      }
    }
  }

  paramsUpdated(params: any) {
    this.updated.emit({ ...this.data, params });
  }

  openSettingsDialog() {
    if (this.dialogRef) {
      this.dialog.open(this.dialogRef);
    }
  }
}
