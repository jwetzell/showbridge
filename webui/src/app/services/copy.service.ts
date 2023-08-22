import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { CopyObject } from '../models/copy-object.model';

@Injectable({
  providedIn: 'root',
})
export class CopyService {
  private maxHistoryLength: number = 20;
  history: CopyObject[] = [];

  currentCopyObject: BehaviorSubject<CopyObject | undefined> = new BehaviorSubject<CopyObject | undefined>(undefined);

  constructor() {}

  setCopyObject(copyObject: CopyObject) {
    this.currentCopyObject.next(copyObject);
    this.history.push(copyObject);
    if (this.history.length > this.maxHistoryLength) {
      this.history.splice(0, 1);
    }
  }

  getClipboardForType(type: 'Trigger' | 'Action' | 'Transform'): Observable<CopyObject | undefined> {
    return this.currentCopyObject.asObservable().pipe(
      filter((val) => val?.type === type),
      filter((val) => !!val)
    );
  }
}
