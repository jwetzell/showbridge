import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css'],
})
export class ActionComponent implements OnInit {
  @Input() path?: string;
  @Input() actionFormGroup?: FormGroup;
  actionIndicatorVisibility: boolean = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    if (this.path) {
      this.eventService.getActionEventsForPath(this.path).subscribe((actionEvent) => {
        if (actionEvent.data.fired) {
          this.flashIndicator();
        }
      });
    }
  }

  flashIndicator() {
    this.actionIndicatorVisibility = true;
    setTimeout(() => {
      this.actionIndicatorVisibility = false;
    }, 200);
  }

  getTransformFormGroups() {
    return (this.actionFormGroup?.get('transforms') as FormArray).controls.map((formControl) => {
      return formControl as FormGroup;
    });
  }

  paramKeys() {
    const paramsFormGroup = this.actionFormGroup?.get('params') as FormGroup;
    return Object.keys(paramsFormGroup.controls);
  }

  getType(): string {
    return this.actionFormGroup?.controls['type'].value;
  }
}
