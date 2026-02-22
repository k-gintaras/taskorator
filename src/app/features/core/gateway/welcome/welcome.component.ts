import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { LoginService } from '../../../../services/login.service';
import { AuthStateManagerService } from '../../../../services/auth-state-manager.service';
import { NAVIGATION_CONFIG } from '../../../../app.config';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  constructor(
    private router: Router,
    private loginService: LoginService,
    public authStateManager: AuthStateManagerService
  ) {}

  continueToApp() {
    try {
      this.router.navigate([NAVIGATION_CONFIG.DEFAULT_AUTHENTICATED_ROUTE]);
    } catch (e) {
      console.error('WelcomeComponent: Continue navigation failed', e);
    }
  }
  currentSlide = 0;
  slides = [
    {
      title: 'Navigate the Tree',
      description:
        'Drill down by overlord, bubble back up. Surface-level loading keeps it snappy.',
      gif: '/assets/readme-resources/tree-view.gif',
    },
    {
      title: 'Create & Split',
      description:
        'Turn one monster into a clean set of atomic tasks without losing why.',
      gif: '/assets/readme-resources/create-task-and-children.gif',
    },
    {
      title: 'Move & Crush',
      description:
        'Reshape plans fast: move between overlords or fuse tasks back into one.',
      gif: '/assets/readme-resources/move-task.gif',
    },
    {
      title: 'Promote / Demote',
      description: 'Adjust gravity in the hierarchy with a click—no ceremony.',
      gif: '/assets/readme-resources/promote-demote.gif',
    },
    {
      title: 'Priority Engine',
      description:
        'Focus/Frog/Favorite + numeric priority + view heat. Secret sauce sorts the rest.',
      gif: '',
    },
    {
      title: 'Tags & Links',
      description:
        'Connect tasks and ideas across projects without losing structure.',
      gif: '',
    },
    {
      title: 'Smart Lists',
      description:
        'A rotating mix of latest, favorites, random, long‑time‑no‑see.',
      gif: '',
    },
    {
      title: 'Offline ⇄ Online',
      description:
        'Work without a connection, sync later—no interruptions to your flow.',
      gif: '',
    },
  ];
  coreSlides = this.slides.slice(0, 4);
  featureSlides = this.slides.slice(4);
  coreIndex = 0;
  featureIndex = 0;

  goToCore(index: number) {
    this.coreIndex = index;
  }
  goToFeature(index: number) {
    this.featureIndex = index;
  }

  startOnlineLogin() {
    // Navigate to the login page
    this.router.navigate(['gateway/login']);
  }
  startOfflineMode() {
    // Perform offline login and redirect to default authenticated route
    this.loginService.loginOffline();
  }
  openTaskoratorList() {
    /* navigate to smart list */
  }
}
