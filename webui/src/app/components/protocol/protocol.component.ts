import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { cloneDeep } from 'lodash';
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
    this.protocol = {
      ...this.protocol,
      ...updatedProtocol,
    };
    this.updated.emit(this.protocol);
  }

  deleteTrigger(index: number) {
    if (this.protocol) {
      this.protocol?.triggers?.splice(index, 1);
    }
    if (!this.pendingUpdate) {
      this.pendingUpdate = cloneDeep(this.protocol);
    }
    this.pendingUpdate?.triggers?.splice(index, 1);
    this.updated.emit(this.pendingUpdate);
  }

  triggerUpdated(index: number, trigger: Trigger) {
    if (this.protocol) {
      if (this.protocol?.triggers !== undefined && this.protocol.triggers[index] !== undefined) {
        if (!this.pendingUpdate) {
          this.pendingUpdate = cloneDeep(this.protocol);
        }
        if (this.pendingUpdate && this.pendingUpdate.triggers) {
          this.pendingUpdate.triggers[index] = {
            ...this.pendingUpdate.triggers[index],
            ...trigger,
          };
          this.updated.emit(this.pendingUpdate);
        }
      }
    }
  }

  addTrigger(triggerType: string) {
    // TODO(jwetzell): figure this out properly
    if (this.protocol && this.protocol?.triggers === undefined) {
      this.protocol.triggers = [];
    }
    if (!this.pendingUpdate) {
      this.pendingUpdate = cloneDeep(this.protocol);
    }
    // TODO(jwetzell): find a way to dummy up the params field
    this.protocol?.triggers?.push({
      type: triggerType,
      enabled: true,
    });

    if (this.pendingUpdate && this.pendingUpdate.triggers === undefined) {
      this.pendingUpdate.triggers = [];
    }

    this.pendingUpdate?.triggers?.push({
      type: triggerType,
      enabled: true,
    });

    this.updated.emit(this.pendingUpdate);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.protocol?.triggers !== undefined) {
      moveItemInArray(this.protocol?.triggers, event.previousIndex, event.currentIndex);
      if (this.pendingUpdate && this.pendingUpdate.triggers) {
        moveItemInArray(this.pendingUpdate.triggers, event.previousIndex, event.currentIndex);
        this.updated.emit(this.pendingUpdate);
      } else {
        this.updated.emit(this.protocol);
      }
    }
  }
}
