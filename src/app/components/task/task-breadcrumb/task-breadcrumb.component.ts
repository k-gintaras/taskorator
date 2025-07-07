import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  NavigationEntry,
  TaskNavigatorHistoryService,
} from '../../../services/tasks/task-navigation/task-navigator-history.service';
import { NgFor, NgIf } from '@angular/common';
import { TaskListRouterService } from '../../../services/tasks/task-navigation/task-list-router.service';
import { Router, RouterLink } from '@angular/router';
import { TaskListKey } from '../../../models/task-list-model';
import { getOverlordPlaceholder } from '../../../services/tasks/task-list/task-list-overlord-placeholders';
import { TaskListSimpleService } from '../../../services/tasks/task-list/task-list-simple.service';
import { TaskNavigatorDataService } from '../../../services/tasks/task-navigation/task-navigator-data.service';
import { TaskNavigatorService } from '../../../services/tasks/task-navigation/task-navigator.service';

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
    private taskListRouteService: TaskListRouterService,
    private taskNavigatorService: TaskNavigatorService
  ) {}

  ngOnInit(): void {
    // Subscribe to navigation history changes
    this.taskNavigationHistoryService.history$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateBreadcrumbs();
        console.log(
          'Breadcrumbs updated:',
          this.breadcrumbs.map((entry) => entry.displayName)
        );
      });

    // Initial load
    this.updateBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    const entry = this.taskNavigationHistoryService.goBack();
    if (entry) {
      this.jumpToEntry(entry);
    }
  }

  jumpToEntry(entry: NavigationEntry): void {
    this.taskNavigatorService.navigateToList(entry.taskListKey);
    this.taskNavigationHistoryService.jumpToEntry(entry);
  }

  private updateBreadcrumbs(): void {
    this.breadcrumbs = this.taskNavigationHistoryService.getBreadcrumbs();
    this.canGoBack = this.taskNavigationHistoryService.canGoBack();
  }

  getRouteUrl(entry: NavigationEntry): string {
    return this.taskListRouteService.getRouteUrl(entry.taskListKey);
  }
}
