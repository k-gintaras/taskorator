import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskNavigatorDataService } from '../../../services/tasks/task-navigation/task-navigator-data.service';
import { TaskNavigatorService } from '../../../services/tasks/task-navigation/task-navigator.service';
import { TaskPathService } from '../../../services/tasks/task-navigation/task-path.service';
import { Observable, map } from 'rxjs';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { combineLatest } from 'rxjs';
import { SelectedOverlordService } from '../../../services/tasks/selected/selected-overlord.service';

@Component({
  selector: 'app-task-breadcrumb',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, AsyncPipe],
  templateUrl: './task-breadcrumb.component.html',
  styleUrl: './task-breadcrumb.component.scss',
})
export class TaskBreadcrumbComponent {
  currentListKey$: Observable<TaskListKey | null>;
  currentPath$: Observable<{ id: string; name: string }[]>;

  constructor(
    private navigatorDataService: TaskNavigatorDataService,
    private navigatorService: TaskNavigatorService,
    private taskPathService: TaskPathService,
    private selectedOverlordService: SelectedOverlordService
  ) {
    this.currentListKey$ = this.navigatorDataService.currentListKey$;

    this.currentPath$ = combineLatest([
      this.taskPathService.currentPath$,
      this.selectedOverlordService.getSelectedOverlordObservable(),
    ]).pipe(
      map(([path, selectedOverlord]) => {
        if (path.length > 0) {
          return path;
        }
        if (selectedOverlord) {
          return [{ id: selectedOverlord.taskId, name: selectedOverlord.name }];
        }
        // fallback: empty array
        return [];
      })
    );
  }

  async goBack(): Promise<void> {
    // Use navigator service to go back one level
    await this.navigatorService.navigateUp();
  }

  jumpTo(id: string) {
    // this.taskPathService.removePath(id);
    this.navigatorService.navigateOutOfTask(id);
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
        return ' Root Tasks';
      default:
        return ' Tasks';
    }
  }
}
