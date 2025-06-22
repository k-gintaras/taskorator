import { Component, Input, OnInit } from '@angular/core';
import { SelectedOverlordService } from '../../services/tasks/selected-overlord.service';
import { TaskNavigatorUltraService } from '../../services/tasks/task-navigation/task-navigator-ultra.service';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { ExtendedTask, getRootTaskObject } from '../../models/taskModelManager';
import { SearchOverlordComponent } from '../search-overlord/search-overlord.component';
import { TaskListRulesService } from '../../services/tasks/task-list-rules.service';
import { TaskViewService } from '../../services/tasks/task-view.service';
import { TaskListKey, TaskListRules } from '../../models/task-list-model';
import { SelectedListService } from '../../services/tasks/selected-list.service';

@Component({
  standalone: true,
  imports: [MatIcon, NgIf, SearchOverlordComponent],
  selector: 'app-overlord-navigator-test',
  templateUrl: './overlord-navigator.component.html',
  styleUrls: ['./overlord-navigator.component.scss'],
})
export class OverlordNavigatorComponentTest implements OnInit {
  selectedOverlord: ExtendedTask | null = null;
  selectedList: TaskListRules | null = null;

  constructor(
    // private taskNavigator: TaskNavigatorUltraService,
    private selectedOverlordService: SelectedOverlordService,
    private selectedListService: SelectedListService,
    private taskListRules: TaskListRulesService
  ) {}

  ngOnInit(): void {
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((id: string | null) => {
        if (id) {
          const base = getRootTaskObject();
          base.name = 'Selected Overlord Placeholder';
          const e: ExtendedTask = {
            isVisible: false,
            animationState: 'highlighted',
            ...base,
          };
          this.selectedOverlord = e;
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

  goToSuperParent(): void {
    if (!this.selectedOverlord) return;
    console.log('this.taskNavigator.previous(this.selectedOverlord.taskId);');
  }

  goBack(): void {
    if (!this.selectedOverlord) return;
    console.log('this.taskNavigator.backToPrevious();');
  }

  goToOverlord(): void {
    if (!this.selectedOverlord) return;
    console.log('this.taskNavigator.next(this.selectedOverlord.taskId);');
  }

  goToRoot(): void {
    console.log('this.taskNavigator.backToStart()');
  }
}
