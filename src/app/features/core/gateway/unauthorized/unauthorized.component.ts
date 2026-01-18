import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionManagerService } from '../../../../services/session-manager.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss'],
})
export class UnauthorizedComponent implements OnInit {
  userId: string | null = null;
  userInfo: any = null;
  error: string | null = null;

  constructor(private session: SessionManagerService) {}

  async ngOnInit(): Promise<void> {
    try {
      const auth = this.session.getAuthStrategy();
      const api = this.session.getApiStrategy();

      const id = await auth.getCurrentUserId();
      this.userId = id ?? null;

      if (api && typeof api.getUserInfo === 'function') {
        this.userInfo = await api.getUserInfo();
      }
    } catch (err: any) {
      this.error = err?.message || String(err);
      console.error('UnauthorizedComponent init error', err);
    }
  }
}
