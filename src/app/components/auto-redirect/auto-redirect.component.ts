import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATION_CONFIG } from '../../app.config';
import { SessionManagerService } from '../../services/session-manager.service';

@Component({
  selector: 'app-auto-redirect',
  standalone: true,
  imports: [],
  templateUrl: './auto-redirect.component.html',
  styleUrl: './auto-redirect.component.scss',
})
export class AutoRedirectComponent implements OnInit {
  constructor(
    private router: Router,
    private sessionManager: SessionManagerService
  ) {}

  async ngOnInit() {
    try {
      await this.sessionManager.waitForInitialization();

      if (this.sessionManager.isLoggedIn()) {
        this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
      } else {
        this.router.navigate([NAVIGATION_CONFIG.DEFAULT_UNAUTHENTICATED_ROUTE]);
      }
    } catch (error) {
      console.error('Auto-redirect error:', error);
      this.router.navigate([NAVIGATION_CONFIG.DEFAULT_UNAUTHENTICATED_ROUTE]);
    }
  }
}
