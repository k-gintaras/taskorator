import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { artificerDetailList, ArtificerDetails } from './artificer.interface';

@Injectable({
  providedIn: 'root',
})
export class ArtificerService {
  constructor() {}
  private currentActionSubject = new BehaviorSubject<ArtificerDetails>(
    artificerDetailList[0]
  );
  public currentAction$ = this.currentActionSubject.asObservable();

  getActions(): ArtificerDetails[] {
    return artificerDetailList;
  }

  setCurrentAction(action: ArtificerDetails): void {
    this.currentActionSubject.next(action);
  }
}
