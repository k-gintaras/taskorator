import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  private slideInterval?: Subscription;

  slides = [
    {
      gif: '/assets/readme-resources/navigating.gif',
      title: 'Navigate with Ease',
      description: 'Seamlessly move through your task hierarchy with our intuitive navigation system.'
    },
    {
      gif: '/assets/readme-resources/create-task-and-children.gif',
      title: 'Create & Organize',
      description: 'Effortlessly create tasks and subtasks to build your perfect project structure.'
    },
    {
      gif: '/assets/readme-resources/tree-view.gif',
      title: 'Tree View Organization',
      description: 'Visualize your entire project structure with our powerful tree view interface.'
    },
    {
      gif: '/assets/readme-resources/promote-demote.gif',
      title: 'Smart Priority Management',
      description: 'Promote and demote tasks to adjust priorities and maintain perfect organization.'
    },
    {
      gif: '/assets/readme-resources/move-task.gif',
      title: 'Flexible Task Movement',
      description: 'Drag and drop tasks between different projects and hierarchies with ease.'
    }
  ];

  features = [
    '🚀 Hierarchical Task Management',
    '📊 Smart Priority System',
    '🔄 Real-time Sync & Offline Mode',
    '🎯 Focus & Frog Task Modes',
    '📈 Progress Tracking',
    '🔍 Advanced Search & Filtering'
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Auto-advance slides every 5 seconds
    this.slideInterval = interval(5000).subscribe(() => {
      this.nextSlide();
    });
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      this.slideInterval.unsubscribe();
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  startOnlineLogin() {
    this.router.navigate(['/gateway/login']);
  }

  startOfflineMode() {
    this.router.navigate(['/gateway/login']); // Let login component handle offline
  }

  learnMore() {
    // Could navigate to a features page or show more info
    this.router.navigate(['/gateway/settings']);
  }
}
