import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATION_CONFIG } from '../../app.config';
import { AuthStateManagerService } from '../../services/auth-state-manager.service';
import { NavigationService } from '../../services/navigation.service';

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
    private authStateManager: AuthStateManagerService,
    private navigationService: NavigationService
  ) {}

  async ngOnInit() {
    try {
      // Ensure auth state is initialized
      await this.authStateManager.ensureInitialized();
      
      // Check if user is authenticated
      if (this.authStateManager.isAuthenticated()) {
        // User is authenticated - check for saved redirect URL
        const redirectUrl = await this.navigationService.getRedirectUrl();
        if (redirectUrl) {
          console.log('AutoRedirect: User authenticated, redirecting to saved URL:', redirectUrl);
          this.navigationService.clearRedirectUrl();
          this.router.navigateByUrl(redirectUrl);
        } else {
          console.log('AutoRedirect: User authenticated, going to default route');
          this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
        }
      } else {
        // User not authenticated - go to unauthenticated route
        console.log('AutoRedirect: User not authenticated, going to welcome');
        this.router.navigate([NAVIGATION_CONFIG.DEFAULT_UNAUTHENTICATED_ROUTE]);
      }
      
    } catch (error) {
      // Auth state initialization failed
      console.error('AutoRedirect: Auth state check failed:', error);
      this.router.navigate([NAVIGATION_CONFIG.DEFAULT_UNAUTHENTICATED_ROUTE]);
    }
  }
}
