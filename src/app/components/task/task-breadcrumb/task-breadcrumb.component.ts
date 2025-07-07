import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskNavigatorDataService } from '../../../services/tasks/task-navigation/task-navigator-data.service';
import { TaskNavigatorService } from '../../../services/tasks/task-navigation/task-navigator.service';
import { TaskPathService } from '../../../services/tasks/task-navigation/task-path.service';
import { TaskListRouterService } from '../../../services/tasks/task-navigation/task-list-router.service';
import { Observable, map } from 'rxjs';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';

@Component({
  selector: 'app-task-breadcrumb',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, AsyncPipe],
  templateUrl: './task-breadcrumb.component.html',
  styleUrl: './task-breadcrumb.component.scss',
})
export class TaskBreadcrumbComponent implements OnInit {
  currentPath$: Observable<string[]>;
  canGoBack$: Observable<boolean>;
  currentListKey$: Observable<TaskListKey | null>;

  constructor(
    private navigatorDataService: TaskNavigatorDataService,
    private navigatorService: TaskNavigatorService,
    private taskPathService: TaskPathService,
    private taskListRouter: TaskListRouterService
  ) {
    this.currentPath$ = this.taskPathService.currentPath$;
    this.canGoBack$ = this.currentPath$.pipe(map((path) => path.length > 1));
    this.currentListKey$ = this.navigatorDataService.currentListKey$;
  }

  ngOnInit(): void {
    // No manual subscriptions needed - template handles reactivity
  }

  async goBack(): Promise<void> {
    // Use navigator service to go back one level
    await this.navigatorService.navigateToCurrentParent();
  }

  jumpToListRoot(): void {
    const currentListKey = this.navigatorDataService.getCurrentListKey();
    if (currentListKey && currentListKey.type !== TaskListType.OVERLORD) {
      this.navigatorService.navigateToList(currentListKey);
    }
  }

  getListDisplayName(listKey: TaskListKey | null): string {
    if (!listKey) return '';

    switch (listKey.type) {
      case TaskListType.DAILY:
        return ' Daily Tasks';
      case TaskListType.WEEKLY:
        return ' Weekly Tasks';
      case TaskListType.MONTHLY:
        return ' Monthly Tasks';
      case TaskListType.YEARLY:
        return ' Yearly Tasks';
      case TaskListType.FOCUS:
        return ' Focus Tasks';
      case TaskListType.FROG:
        return ' Frog Tasks';
      case TaskListType.FAVORITE:
        return ' Favorites';
      case TaskListType.LATEST_CREATED:
        return ' Latest Created';
      case TaskListType.LATEST_UPDATED:
        return ' Latest Updated';
      case TaskListType.SESSION:
        return ' Session';
      case TaskListType.OVERLORD:
        return ' Tasks';
      default:
        return ' Tasks';
    }
  }
}
