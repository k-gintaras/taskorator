import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class CurrentInputService {
  private currentInput: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );

  constructor() {}

  updateCurrentInput(input: string) {
    this.currentInput.next(input);
  }

  getCurrentInput() {
    return this.currentInput.asObservable();
  }
}
