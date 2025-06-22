import { Component, Input, OnInit } from '@angular/core';
import { SelectedOverlordService } from '../../services/tasks/selected-overlord.service';
import { TaskNavigatorUltraService } from '../../services/tasks/task-navigation/task-navigator-ultra.service';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { ExtendedTask } from '../../models/taskModelManager';
import { SearchOverlordComponent } from '../search-overlord/search-overlord.component';
import { TaskListRulesService } from '../../services/tasks/task-list-rules.service';
import { TaskViewService } from '../../services/tasks/task-view.service';
import { TaskListKey, TaskListRules } from '../../models/task-list-model';
import { SelectedListService } from '../../services/tasks/selected-list.service';

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
    private taskNavigator: TaskNavigatorUltraService,
    private selectedOverlordService: SelectedOverlordService,
    private taskService: TaskService,
    private selectedListService: SelectedListService,
    private taskListRules: TaskListRulesService
  ) {}

  ngOnInit(): void {
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((id: string | null) => {
        if (id)
          this.taskService.getTaskById(id).then((o: ExtendedTask | null) => {
            this.selectedOverlord = o;
          });
      });

    this.selectedListService.selectedListKey$.subscribe(
      (l: TaskListKey | null) => {
        if (l) {
          this.selectedList = this.taskListRules.getList(l);
        }
      }
    );
  }

  goToSuperParent(): void {
    if (!this.selectedOverlord) return;
    this.taskNavigator.previous(this.selectedOverlord.taskId);
  }

  goBack(): void {
    if (!this.selectedOverlord) return;
    this.taskNavigator.backToPrevious();
  }

  goToOverlord(): void {
    if (!this.selectedOverlord) return;
    this.taskNavigator.next(this.selectedOverlord.taskId);
  }

  goToRoot(): void {
    this.taskNavigator.backToStart();
  }
}
