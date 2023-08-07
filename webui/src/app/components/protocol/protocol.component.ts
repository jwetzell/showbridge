import { trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ProtocolConfiguration } from 'src/app/models/config.models';
import { Trigger } from 'src/app/models/trigger.model';
import { EventService } from 'src/app/services/event.service';
import { FormGroupService } from 'src/app/services/form-group.service';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-protocol',
  templateUrl: './protocol.component.html',
  styleUrls: ['./protocol.component.css'],
})
export class ProtocolComponent {
  @Input() protocolType?: string;
  @Input() protocol?: ProtocolConfiguration;
  @Output() updated: EventEmitter<ProtocolConfiguration> = new EventEmitter<ProtocolConfiguration>();
  triggerTypes: string[] = [];

  constructor(private schemaService: SchemaService) {}

  ngOnInit() {
    if (this.protocolType) {
      this.triggerTypes = this.schemaService.getTriggerTypesForProtocol(this.protocolType);
    }
  }

  protocolUpdated(updatedProtocol: ProtocolConfiguration) {
    this.protocol = {
      ...this.protocol,
      ...updatedProtocol,
    };
    this.updated.emit(this.protocol);
  }

  deleteTrigger(index: number) {
    if (this.protocol) {
      this.protocol?.triggers?.splice(index, 1);
      this.updated.emit(this.protocol);
    }
  }

  triggerUpdated(index: number, trigger: Trigger) {
    if (this.protocol) {
      if (this.protocol?.triggers !== undefined && this.protocol.triggers[index] !== undefined) {
        const protocolCopy = JSON.parse(JSON.stringify(this.protocol));
        protocolCopy.triggers[index] = trigger;
        this.updated.emit(protocolCopy);
      }
    }
  }

  addTrigger(triggerType: string) {
    this.protocol?.triggers?.push({
      type: triggerType,
      enabled: true,
    });
  }
}
