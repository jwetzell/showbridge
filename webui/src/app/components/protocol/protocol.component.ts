import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ProtocolConfiguration } from 'src/app/models/config.models';
import { Trigger } from 'src/app/models/trigger.model';
import { EventService } from 'src/app/services/event.service';
import { FormGroupService } from 'src/app/services/form-group.service';

@Component({
  selector: 'app-protocol',
  templateUrl: './protocol.component.html',
  styleUrls: ['./protocol.component.css'],
})
export class ProtocolComponent implements OnChanges {
  @Input() protocolType?: string;
  @Input() protocol?: ProtocolConfiguration;
  @Output() updated: EventEmitter<ProtocolConfiguration> = new EventEmitter<ProtocolConfiguration>();

  protocolFormGroup?: FormGroup;
  constructor(
    private eventService: EventService,
    private formGroupService: FormGroupService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.protocol && this.protocolType) {
      this.protocolFormGroup = this.formGroupService.getProtocolFormGroup(this.protocolType, this.protocol);
      this.protocolFormGroup.patchValue(this.protocol);
      this.protocolFormGroup.valueChanges.subscribe((value) => {
        if (value.params) {
          Object.keys(value.params).forEach((paramKey) => {
            console.log(value.params[paramKey]);
            // TODO(jwetzell): find better way to do this number parsing stuff
            try {
              value.params[paramKey] = parseInt(value.params[paramKey]);
            } catch (error) {
              console.error(error);
            }
          });
        }
        this.updated.emit(value);
      });
    }
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

  paramKeys() {
    const paramsFormGroup = this.protocolFormGroup?.get('params') as FormGroup;
    return Object.keys(paramsFormGroup.controls);
  }
}
