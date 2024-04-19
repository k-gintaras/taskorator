import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectedTaskService } from 'src/app/services/task/selected-task.service';
import { completeButtonColorMap } from 'src/app/models/colors';
import {
  Settings,
  getButtonName,
  getDefaultSettings,
} from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';
import { SettingsService } from 'src/app/services/core/settings.service';
import { TaskObjectHelperService } from 'src/app/features/input-to-tasks/services/task-object-helper.service';
import { TaskUpdateService } from 'src/app/services/task/task-update.service';
import { FilterService } from 'src/app/services/task/filter.service';
import { PreviousService } from 'src/app/services/task/previous.service';
import { SortService } from 'src/app/services/task/sort.service';
import { TaskNavigatorService } from 'src/app/services/task/task-navigator.service';
import { ConfigService } from 'src/app/services/core/config.service';
import { SelectedMultipleService } from 'src/app/services/task/selected-multiple.service';

@Component({
  selector: 'app-task-navigator',
  templateUrl: './task-navigator.component.html',
  styleUrls: ['./task-navigator.component.css'],
})
export class TaskNavigatorComponent implements OnInit {
  tasks: Task[] = [];
  settings: Settings = getDefaultSettings();
  selectedOverlord: Task | undefined;
  selectedTasks: Task[] = [];

  constructor(
    private taskUpdateService: TaskUpdateService,
    private taskObjectService: TaskObjectHelperService,
    private selectedMultiple: SelectedMultipleService,
    private selected: SelectedTaskService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private sortService: SortService,
    private filterService: FilterService,
    private previousService: PreviousService,
    private taskNavigatorService: TaskNavigatorService,
    private config: ConfigService
  ) {}

  ngOnInit() {
    this.settingsService.getSettings().subscribe((s: Settings | null) => {
      if (s) {
        this.settings = s;
        this.previousService
          .getPreviousOverlordId(this.route, this.settings)
          .then((overlordId: string | undefined) => {
            if (overlordId) {
              this.loadTaskNavigationView(overlordId);
            } else {
              console.log('could not load previous task');
            }
          });
      }
    });

    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });

    this.taskNavigatorService.getTaskNavigationView().subscribe((view) => {
      if (view) {
        this.selectedOverlord = view.taskOverlord;
        this.tasks = view.taskChildren;
        this.setNewFiltered(this.tasks);
      }
    });
  }

  private async loadTaskNavigationView(overlordId: string) {
    await this.taskNavigatorService.loadTaskNavigationView(overlordId);
  }

  async goBack(task: Task | undefined) {
    if (!task || !task.overlord) {
      this.errorNoTaskOrOverlord(task);
    } else {
      await this.taskNavigatorService.back(task);
    }
  }

  async onPrevious(task: Task | undefined) {
    if (!task || !task.overlord) {
      this.errorNoTaskOrOverlord(task);
    } else {
      await this.taskNavigatorService.previous(task);
    }
  }

  async onNext(task: Task) {
    if (!task || !task.taskId) {
      console.error('Invalid task or task ID provided.');
    } else {
      await this.taskNavigatorService.next(task);
    }
  }

  setNewFiltered(arr: Task[]) {
    this.tasks = arr;
    if (this.settings) {
      this.tasks = this.filterService.filterBySettings(
        this.tasks,
        this.settings
      );
    }
    this.sortService.sortByPriority(this.tasks);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorNoTaskOrOverlord(task: Task | undefined) {
    console.log('No task or task overlord defined.');
  }

  errorNoChildrenInside() {
    console.log('No children inside this task.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorNoTasksOutside(task: Task | undefined) {
    console.log('No tasks above this task.');
  }

  onTaskCardClick(task: Task) {
    if (this.selectedTasks.indexOf(task) > -1) {
      this.selectedMultiple.removeSelectedTask(task);
    } else {
      this.selectedMultiple.addSelectedTask(task);
    }

    if (task) {
      this.selected.setSelectedTask(task);
    }
  }

  isSelected(task: Task): boolean {
    return this.selectedTasks.indexOf(task) > -1;
  }

  getOverlord(task: Task) {
    if (!this.tasks) return task;
    return this.taskObjectService.getOverlord(task, this.tasks);
  }

  complete(task: Task) {
    if (this.settings) {
      switch (this.settings.completeButtonAction) {
        case 'completed':
          console.log('completed ' + task.name);
          this.taskUpdateService.complete(task);
          break;
        case 'archived':
          console.log('archived ' + task.name);
          this.taskUpdateService.archive(task);
          break;
        case 'deleted':
          console.log('deleted ' + task.name);
          this.taskUpdateService.delete(task);
          break;
        case 'todo':
          console.log('todo ' + task.name);
          this.taskUpdateService.renew(task);
          break;
        case 'seen':
          console.log('seen ' + task.name);
          this.taskUpdateService.setAsSeen(task);
          break;
        default:
          break;
      }
    } else {
      console.error('Settings not loaded');
    }
  }

  addChild(task: Task) {
    this.onClickPlus(task);
  }

  promote(task: Task) {
    this.taskUpdateService.increasePriority(task);
  }

  demote(task: Task) {
    this.taskUpdateService.decreasePriority(task);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClickPlus(task: Task): void {
    // const dialogRef = this.dialog.open(CreateSimpleTaskComponent, {
    //   width: '300px',
    //   data: { overlord: task },
    // });
  }

  getButtonName() {
    if (!this.settings) return 'Complete';
    return getButtonName(this.settings.completeButtonAction);
  }

  getColorBySetting() {
    if (!this.settings) return 'black';
    return (
      completeButtonColorMap[this.settings.completeButtonAction] || 'black'
    );
  }
}
