import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service to communicate drawer close events between components.
 * Used by child components (artificer, extra-actions) to request the drawer to close.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationDrawerService {
  private closeDrawerSubject = new Subject<void>();
  
  // Observable that components can subscribe to
  public closeDrawer$ = this.closeDrawerSubject.asObservable();

  /**
   * Request the navigation drawer to close.
   * This should be called when an action is selected that warrants closing the menu.
   */
  requestDrawerClose(): void {
    this.closeDrawerSubject.next();
  }
}
