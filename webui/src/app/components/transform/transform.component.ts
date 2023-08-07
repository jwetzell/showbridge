import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  transformIndicatorVisibility: boolean = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    if (this.path) {
      this.eventService.getTransformEventsForPath(this.path).subscribe((transformEvent) => {
        if (transformEvent.data.fired) {
          this.flashIndicator();
        }
      });
    }
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  update(transform: Transform) {
    this.updated.emit(transform);
  }

  flashIndicator() {
    this.transformIndicatorVisibility = true;
    setTimeout(() => {
      this.transformIndicatorVisibility = false;
    }, 200);
  }
}
