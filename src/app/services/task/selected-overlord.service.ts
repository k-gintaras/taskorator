import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SelectedOverlordService {
  private selectedOverlord = new BehaviorSubject<string | null>(null);

  getSelectedOverlordObservable(): Observable<string | null> {
    return this.selectedOverlord.asObservable();
  }

  getSelectedOverlord(): string | null {
    return this.selectedOverlord.value;
  }

  setSelectedOverlord(taskId: string) {
    this.selectedOverlord.next(taskId);
  }
}
