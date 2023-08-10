import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { merge } from 'lodash';
import { debounceTime, tap } from 'rxjs';
import { Transform } from 'src/app/models/transform.model';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-transform',
  templateUrl: './transform.component.html',
  styleUrls: ['./transform.component.css'],
})
export class TransformComponent implements OnInit {
  @Input() transform?: Transform;
  @Input() path?: string;

  @Output() delete: EventEmitter<string> = new EventEmitter<string>();
  @Output() updated: EventEmitter<Transform> = new EventEmitter<Transform>();

  indicatorColor: string = 'gray';
  pendingUpdate?: Transform;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    if (this.path) {
      this.eventService
        .getTransformEventsForPath(this.path)
        .pipe(
          tap((transformEvent) => {
            if (transformEvent.data.fired) {
              this.indicatorColor = 'greenyellow';
            }
          }),
          debounceTime(200)
        )
        .subscribe((transformEvent) => {
          this.indicatorColor = 'gray';
        });
    }
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  update(transform: Transform) {
    merge(this.transform, transform);
    this.updated.emit(this.transform);
  }
}
