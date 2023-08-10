import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { cloneDeep, merge } from 'lodash';
import { ProtocolConfiguration } from 'src/app/models/config.models';
import { ItemInfo } from 'src/app/models/form.model';
import { Trigger } from 'src/app/models/trigger.model';
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
  triggerTypes: ItemInfo[] = [];

  pendingUpdate?: ProtocolConfiguration;

  constructor(private schemaService: SchemaService) {}

  ngOnInit() {
    if (this.protocolType) {
      this.triggerTypes = this.schemaService.getTriggerTypesForProtocol(this.protocolType);
    }
  }

  protocolUpdated(updatedProtocol: ProtocolConfiguration) {
    merge(this.protocol, updatedProtocol);
    this.pendingUpdate = cloneDeep(this.protocol);
    this.updated.emit(this.pendingUpdate);
  }

  deleteTrigger(index: number) {
    this.protocol?.triggers?.splice(index, 1);
    this.pendingUpdate = cloneDeep(this.protocol);
    this.updated.emit(this.pendingUpdate);
  }

  triggerUpdated(index: number, trigger: Trigger) {
    if (this.protocol?.triggers !== undefined && this.protocol.triggers[index] !== undefined) {
      merge(this.protocol.triggers[index], trigger);

      this.pendingUpdate = cloneDeep(this.protocol);
      this.updated.emit(this.pendingUpdate);
    }
  }

  addTrigger(triggerType: string) {
    if (this.protocol && this.protocol?.triggers === undefined) {
      this.protocol.triggers = [];
    }
    const triggerTemplate = this.schemaService.getTemplateForTrigger(triggerType);
    this.protocol?.triggers?.push(triggerTemplate);
    this.pendingUpdate = cloneDeep(this.protocol);
    this.updated.emit(this.pendingUpdate);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.protocol?.triggers !== undefined) {
      moveItemInArray(this.protocol?.triggers, event.previousIndex, event.currentIndex);
      this.pendingUpdate = cloneDeep(this.protocol);
      this.updated.emit(this.pendingUpdate);
    }
  }
}
