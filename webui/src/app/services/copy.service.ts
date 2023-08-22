import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { CopyObject } from '../models/copy-object.model';

@Injectable({
  providedIn: 'root',
})
export class CopyService {
  currentCopyObject: BehaviorSubject<CopyObject | undefined> = new BehaviorSubject<CopyObject | undefined>(undefined);

  constructor() {}

  setCopyObject(copyObject: CopyObject) {
    this.currentCopyObject.next(copyObject);
  }

  getClipboardForType(type: 'Trigger' | 'Action' | 'Transform'): Observable<CopyObject | undefined> {
    return this.currentCopyObject.asObservable().pipe(
      filter((val) => val?.type === type),
      filter((val) => !!val)
    );
  }
}
