import { Component, OnInit } from '@angular/core';
import { NgIf, JsonPipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { TaskUserInfo } from '../../../models/service-strategies/user';
import { SessionManagerService } from '../../../services/session-manager.service';
import { AiApiAuthTestComponent } from '../ai-api-auth-test/ai-api-auth-test.component';
/**
 * @deprecated This component/service is deprecated and will be removed in future releases.
 * Contains test utilities for AI-API authentication and admin operations.
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgIf, JsonPipe, MatTabsModule, AiApiAuthTestComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  currentUserId: string | null = null;
  currentUserInfo: TaskUserInfo | null = null;

  constructor(private sessionManager: SessionManagerService) {}

  async ngOnInit(): Promise<void> {
    await this.loadCurrentUserInfo();
  }

  private async loadCurrentUserInfo(): Promise<void> {
    try {
      const auth = this.sessionManager.getAuthStrategy();
      const api = this.sessionManager.getApiStrategy();
      this.currentUserId = (await auth.getCurrentUserId()) ?? null;
      if (api && typeof api.getUserInfo === 'function') {
        this.currentUserInfo = (await api.getUserInfo()) ?? null;
      }
    } catch (err) {
      console.error('Failed to load current user info:', err);
    }
  }
}
