import { Component, ElementRef, ViewChild } from '@angular/core';
import { ErrorService } from '../../services/core/error.service';
import { ConfigService } from '../../services/core/config.service';
import { ServiceInitiatorService } from '../../services/core/service-initiator.service';
import { NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SelectedMultipleService } from '../../services/task/selected-multiple.service';
import { Task } from '../../models/taskModelManager';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [NgIf, RouterOutlet, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  @ViewChild('navLinks') navLinks: ElementRef<HTMLDivElement> | undefined;
  leftShadowVisible = false;
  rightShadowVisible = true;
  title = 'taskorator';
  testing = true;
  authenticated = true;

  feedback = ''; // Change feedbacks array to a single string variable
  isThereSelectedTasks = false;

  constructor(
    private errorService: ErrorService,
    private config: ConfigService,
    private initService: ServiceInitiatorService,
    private selectedTasks: SelectedMultipleService
  ) {
    this.errorService.getFeedback().subscribe((message) => {
      if (message) this.feedback = message; // Assign the new message to feedback
    });
  }

  ngAfterViewInit() {
    if (!this.navLinks) return;
    this.updateShadowVisibility();
    this.navLinks.nativeElement.addEventListener('scroll', () => {
      this.updateShadowVisibility();
    });
  }

  updateShadowVisibility() {
    if (!this.navLinks) return;

    const el = this.navLinks.nativeElement;
    const isScrollable = el.scrollWidth > el.clientWidth;
    this.leftShadowVisible = isScrollable && el.scrollLeft > 0;
    this.rightShadowVisible =
      isScrollable && el.scrollLeft < el.scrollWidth - el.clientWidth;
  }

  checkScroll() {
    if (this.navLinks && this.navLinks.nativeElement) {
      const el = this.navLinks.nativeElement;
      this.leftShadowVisible = el.scrollLeft > 0;
      this.rightShadowVisible = el.scrollLeft < el.scrollWidth - el.clientWidth;
    }
  }

  async ngOnInit(): Promise<void> {
    this.selectedTasks.getSelectedTasks().subscribe((t: Task[]) => {
      if (t) {
        this.isThereSelectedTasks = t.length > 0;
      }
    });
    this.initService
      .getInitializationStatus()
      .subscribe((initialized: boolean) => {
        if (initialized) {
          this.authenticated = this.config.getAuthStrategy().isAuthenticated();
          this.testing = this.config.isTesting();
          if (this.authenticated) {
            console.log('Authenticated: ' + this.authenticated);
          }
        }
      });
  }
}
