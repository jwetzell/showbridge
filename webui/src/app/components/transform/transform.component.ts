import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EventService } from 'src/app/services/event.service';
import { FormGroupService } from 'src/app/services/form-group.service';

@Component({
  selector: 'app-transform',
  templateUrl: './transform.component.html',
  styleUrls: ['./transform.component.css'],
})
export class TransformComponent implements OnInit {
  @Input() transformFormGroup?: FormGroup;
  @Input() path?: string;
  transformIndicatorVisibility: boolean = false;

  constructor(
    private formGroupService: FormGroupService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    if (this.path) {
      this.eventService.getTransformEventsForPath(this.path).subscribe((transformEvent) => {
        if (transformEvent.data.fired) {
          this.flashIndicator();
        }
      });
    }
  }

  paramKeys() {
    const paramsFormGroup = this.transformFormGroup?.get('params') as FormGroup;
    return Object.keys(paramsFormGroup.controls);
  }

  flashIndicator() {
    this.transformIndicatorVisibility = true;
    setTimeout(() => {
      this.transformIndicatorVisibility = false;
    }, 200);
  }

  getType(): string {
    return this.transformFormGroup?.controls['type'].value;
  }
}
