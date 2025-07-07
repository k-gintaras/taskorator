import { Component, Input, OnInit } from '@angular/core';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { ExtendedTask } from '../../models/taskModelManager';
import { SearchOverlordComponent } from '../search-overlord/search-overlord.component';
import { TaskListRulesService } from '../../services/tasks/task-list/task-list-rules.service';
import { TaskListKey, TaskListRules } from '../../models/task-list-model';
import { SelectedListService } from '../../services/tasks/selected/selected-list.service';

@Component({
  standalone: true,
  imports: [MatIcon, NgIf, SearchOverlordComponent],
  selector: 'app-overlord-navigator',
  templateUrl: './overlord-navigator.component.html',
  styleUrls: ['./overlord-navigator.component.scss'],
})
export class OverlordNavigatorComponent implements OnInit {
  selectedOverlord: ExtendedTask | null = null;
  selectedList: TaskListRules | null = null;

  constructor(
    private selectedOverlordService: SelectedOverlordService,
    private taskService: TaskService,
    private selectedListService: SelectedListService,
    private taskListRules: TaskListRulesService
  ) {}

  ngOnInit(): void {
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord: ExtendedTask | null) => {
        if (overlord) {
          this.selectedOverlord = overlord;
        }
      });

    this.selectedListService.selectedListKey$.subscribe(
      (l: TaskListKey | null) => {
        if (l) {
          this.selectedList = this.taskListRules.getList(l);
        }
      }
    );
  }

  // TODO: get rid of this component OR... expand to use breadcrumbs??? or simplify ???
  goToSuperParent(): void {
    if (!this.selectedOverlord) return;
    // this.taskNavigator.previous(this.selectedOverlord.taskId);
  }

  goBack(): void {
    if (!this.selectedOverlord) return;
    // this.taskNavigator.backToPrevious();
  }

  goToOverlord(): void {
    if (!this.selectedOverlord) return;
    // this.taskNavigator.next(this.selectedOverlord.taskId);
  }

  goToRoot(): void {
    // this.taskNavigator.backToStart();
  }
}
