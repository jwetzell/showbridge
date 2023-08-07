import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { Trigger } from 'src/app/models/trigger.model';
import { EventService } from 'src/app/services/event.service';
import { FormGroupService } from 'src/app/services/form-group.service';
@Component({
  selector: 'app-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.css'],
})
export class TriggerComponent implements OnInit {
  // @Input() trigger?: Trigger;
  @Input() path?: string;
  @Output() updated: Subject<Trigger> = new Subject<Trigger>();

  triggerIndicatorVisibility: boolean = false;

  @Input() triggerFormGroup?: FormGroup;

  constructor(
    private formGroupService: FormGroupService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    if (this.path) {
      this.eventService.getTriggersForPath(this.path).subscribe((triggerEvent) => {
        if (triggerEvent.data.fired) {
          this.flashIndicator();
        }
      });
    }
    if (this.triggerFormGroup) {
      this.triggerFormGroup.valueChanges.subscribe((value) => {
        this.updated.next(value);
      });
    }
  }

  flashIndicator() {
    this.triggerIndicatorVisibility = true;
    setTimeout(() => {
      this.triggerIndicatorVisibility = false;
    }, 200);
  }

  getActionFormGroups() {
    return (this.triggerFormGroup?.get('actions') as FormArray).controls.map((formControl) => {
      return formControl as FormGroup;
    });
  }

  getType(): string {
    return this.triggerFormGroup?.controls['type'].value;
  }

  paramKeys() {
    const paramsFormGroup = this.triggerFormGroup?.get('params') as FormGroup;
    return Object.keys(paramsFormGroup.controls);
  }
}
