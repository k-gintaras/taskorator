import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskNavigatorUltraService } from '../../../services/tasks/task-navigation/task-navigator-ultra.service';
import {
  NavigationEntry,
  TaskNavigatorHistoryService,
} from '../../../services/tasks/task-navigation/task-navigator-history.service';
import { NgFor, NgIf } from '@angular/common';
import { TaskListRouterService } from '../../../services/tasks/task-navigation/task-list-router.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-task-breadcrumb',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './task-breadcrumb.component.html',
  styleUrl: './task-breadcrumb.component.scss',
})
export class TaskBreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: NavigationEntry[] = [];
  canGoBack = false;

  private destroy$ = new Subject<void>();

  constructor(
    private taskNavigationHistoryService: TaskNavigatorHistoryService,
    private taskListRouteService: TaskListRouterService
  ) {}

  ngOnInit(): void {
    // Subscribe to navigation history changes
    this.taskNavigationHistoryService.history$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateBreadcrumbs();
      });

    // Initial load
    this.updateBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.taskNavigationHistoryService.goBack();
  }

  jumpToEntry(entry: NavigationEntry): void {
    // this.taskNavigationHistoryService.jumpToEntry(entry);
    // // Manually trigger navigation to update the view
    // this.taskNavigationHistoryService['updateView'](entry.taskListKey);
    // if (entry.taskId) {
    //   this.taskNavigationHistoryService['selectedOverlord'].setSelectedOverlord(
    //     entry.taskId
    //   );
    // }
  }

  private updateBreadcrumbs(): void {
    this.breadcrumbs = this.taskNavigationHistoryService.getBreadcrumbs();
    this.canGoBack = this.taskNavigationHistoryService.canGoBack();
  }

  getRouteUrl(entry: NavigationEntry): string {
    if (entry.taskListKey.type !== 'overlord') {
      // it is a generated task list, we cannot navigate back to it, because this list of tasks does not have parent task..., we must use use URL to get there
    }
    return this.taskListRouteService.getRouteUrl(entry.taskListKey);
  }

  // TODO: if
}
