import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ProtocolConfiguration } from 'src/app/models/config.models';
import { EventService } from 'src/app/services/event.service';
import { FormGroupService } from 'src/app/services/form-group.service';

@Component({
  selector: 'app-protocol-view',
  templateUrl: './protocol-view.component.html',
  styleUrls: ['./protocol-view.component.css'],
})
export class ProtocolViewComponent implements OnChanges {
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
        console.log(value);
        if (value.params) {
          Object.keys(value.params).forEach((paramKey) => {
            console.log(value.params[paramKey]);
            try {
              value.params[paramKey] = parseInt(value.params[paramKey]);
            } catch (error) {
              console.error(error);
            }
          });
        }
        console.log(value);
        this.updated.emit(value);
      });
    }
  }

  getTriggerFormGroups() {
    return (this.protocolFormGroup?.get('triggers') as FormArray).controls.map((formControl) => {
      return formControl as FormGroup;
    });
  }

  paramKeys() {
    const paramsFormGroup = this.protocolFormGroup?.get('params') as FormGroup;
    return Object.keys(paramsFormGroup.controls);
  }
}
