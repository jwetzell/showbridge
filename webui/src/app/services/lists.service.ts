import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  public triggerListIds: string[] = [];
  public actionListIds: string[] = [];
}
