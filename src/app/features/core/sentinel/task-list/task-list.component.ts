import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Task, getBaseTask } from '../../../../models/taskModelManager';
import { TaskNavigatorUltraService } from '../../../task-navigator/services/task-navigator-ultra.service';
import { ArtificerComponent } from '../../../../components/artificer/artificer.component';
import { CreateTaskComponent } from '../../../../components/create-task/create-task.component';
import { SimpleNavigatorComponent } from '../../../task-navigator/simple-navigator/simple-navigator.component';
import { SelectedOverlordService } from '../../../../services/task/selected-overlord.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatList,
    MatListItem,
    MatIcon,
    MatButton,
    MatProgressSpinner,
    MatChipsModule,
    ArtificerComponent,
    CreateTaskComponent,
    SimpleNavigatorComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  @Input() tasks: Task[] | null = null;
  @Input() title: string = 'Tasks';
  selectedOverlordName = '';
  errorMessage: string | null = null;

  constructor(
    private navigatorService: TaskNavigatorUltraService,
    private selectedOverlord: SelectedOverlordService
  ) {}

  ngOnInit() {
    this.initializeTasks();
    this.selectedOverlord.getSelectedOverlordObservable().subscribe((s) => {
      this.selectedOverlordName = s?.name || '';
    });
  }

  private initializeTasks() {
    if (!this.tasks) {
      this.errorMessage = 'No tasks provided.';
      return;
    }

    const overlord = getBaseTask(); // Set up the root task
    overlord.name = 'Root';

    console.log('this');
    console.log(this.tasks);
    this.navigatorService.setInitialTasks(overlord, this.tasks);
    this.navigatorService.setTaskNavigationView(overlord, this.tasks);
  }
}
