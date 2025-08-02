import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CORE_APP_METADATA } from '../../../../app.routes-metadata';
import { AuthStateManagerService } from '../../../../services/auth-state-manager.service';

@Component({
  selector: 'app-sentinel',
  standalone: true,
  templateUrl: './sentinel.component.html',
  styleUrls: ['./sentinel.component.scss'],
  imports: [RouterOutlet],
})
export class SentinelComponent implements OnInit {
  data = CORE_APP_METADATA['sentinel'];

  constructor(
    private router: Router,
    private authStateManager: AuthStateManagerService
  ) {}

  async ngOnInit() {
    try {
      // Ensure auth state and session are initialized
      await this.authStateManager.ensureInitialized();
      
      // Check if user is authenticated (auth guard should have already done this)
      if (!this.authStateManager.isAuthenticated()) {
        this.router.navigate(['/welcome']);
        return;
      }
      
    } catch (error) {
      console.error('Sentinel: Auth state check failed:', error);
      this.router.navigate(['/welcome']);
    }
  }
}
