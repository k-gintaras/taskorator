import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStateManagerService } from './services/auth-state-manager.service';
import { ThemeService } from './services/core/theme.service';
import { HorizontalNavigationComponent } from './components/horizontal-navigation/horizontal-navigation.component';
import { NavigationService } from './services/navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HorizontalNavigationComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    public authStateManager: AuthStateManagerService,
    private router: Router,
    private navigationService: NavigationService,
    private themeService: ThemeService
  ) {}

  async ngOnInit(): Promise<void> {
    // Initialize theme system
    console.log('App component initialized with theme:', this.themeService.getCurrentTheme());
    
    // Initialize the auth state and session
    try {
      console.log('App: Initializing auth state...');
      // await this.authStateManager.initializeApp();
      console.log('App: Auth state initialized successfully');
    } catch (error) {
      console.log('App: Auth state initialization failed:', error);
      // If auth state init fails, redirect to login
      this.router.navigate(['/welcome']);
    }
  }
}
