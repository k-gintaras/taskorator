import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionManagerService } from './services/session-manager.service';
import { NAVIGATION_CONFIG } from './app.config';
import { HorizontalNavigationComponent } from './components/horizontal-navigation/horizontal-navigation.component';
import { NavigationService } from './services/navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HorizontalNavigationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private sessionManager: SessionManagerService,
    private router: Router,
    private navigationService: NavigationService
  ) {}

  async ngOnInit(): Promise<void> {
    // Initialize the session (online or offline)
    await this.sessionManager.initialize('online');

    // Redirect based on login state
    const isLoggedIn = this.sessionManager.isLoggedIn();
    if (isLoggedIn) {
      const previousRoute = await this.navigationService.getRedirectUrl();
      // i mean... if logged in, why redirect, just allow go wherever they want ???
      // TODO: previous route always null, fix this
      // if (!previousRoute) {
      //   this.router.navigate([NAVIGATION_CONFIG.ON_LOGIN_ROUTE_URL]); // Replace with your default route
      // }
      // console.warn('Redirecting to previous route:', previousRoute);
      // this.router.navigate([previousRoute]);
    } else {
      this.router.navigate(['/login']); // Redirect to login if not authenticated
    }
  }
}
