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

  indicatorColor: string = 'gray';
  pendingUpdate?: Transform;

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
    if (!this.pendingUpdate) {
      this.pendingUpdate = JSON.parse(JSON.stringify(this.transform));
    }
    this.pendingUpdate = {
      ...this.pendingUpdate,
      ...transform,
    };
    this.transform = {
      ...this.pendingUpdate,
      ...transform,
    };
    this.updated.emit(this.pendingUpdate);
  }

  flashIndicator() {
    this.indicatorColor = 'greenyellow';
    setTimeout(() => {
      this.indicatorColor = 'gray';
    }, 200);
  }
}
