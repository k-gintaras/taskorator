import { Component, Input, OnInit } from '@angular/core';
import { Task } from '../../../models/taskModelManager';
import { TaskUpdateService } from '../../../services/task/task-update.service';
import { SettingsService } from '../../../services/core/settings.service';
import {
  getButtonMatName,
  getDefaultSettings,
  TaskSettings,
} from '../../../models/settings';
import { completeButtonColorMap } from '../../../models/colors';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-task-action',
  standalone: true,
  imports: [MatIcon, MatButtonModule, LowerCasePipe],
  templateUrl: './action.component.html',
  styleUrl: './action.component.scss',
})
export class TaskActionComponent implements OnInit {
  @Input() task: Task | undefined;
  settings: TaskSettings = getDefaultSettings();

  constructor(
    private taskUpdateService: TaskUpdateService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe((s: TaskSettings | null) => {
      if (s) {
        this.settings = s;
      }
    });
  }

  complete(task: Task | undefined) {
    if (!task) return;
    if (!this.settings) return;
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
  }

  addChild(task: Task) {
    this.onClickPlus(task);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClickPlus(task: Task): void {
    // const dialogRef = this.dialog.open(CreateSimpleTaskComponent, {
    //   width: '300px',
    //   data: { overlord: task },
    // });
  }

  getButtonName() {
    return getButtonMatName(this.settings.completeButtonAction);
  }

  getColorBySetting() {
    if (!this.settings) return 'black';
    return (
      completeButtonColorMap[this.settings.completeButtonAction] || 'black'
    );
  }
}
