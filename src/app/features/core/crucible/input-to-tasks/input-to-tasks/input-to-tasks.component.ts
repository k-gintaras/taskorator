import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, ExtendedTask } from '../../../../../models/taskModelManager';
import { InputToTasksService } from '../services/input-to-tasks.service';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';
import { MatFormField } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TextType } from '../services/text-type-detector.service';
import { TaskUtilityService } from '../../../../../services/tasks/task-utility.service';
import { TaskBatchService } from '../../../../../services/tasks/task-batch.service';

@Component({
  selector: 'app-input-to-tasks',
  standalone: true,
  imports: [
    FormsModule,
    StagedTaskListComponent,
    MatFormField,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  templateUrl: './input-to-tasks.component.html',
  styleUrls: ['./input-to-tasks.component.scss'],
})
export class InputToTasksComponent implements OnInit {
  inputText = '';
  tasks: Task[] = [];
  taskSummary: {
    taskCount: number;
    uniqueTaskCount: number;
    inputType: TextType | null;
  } = {
    taskCount: 0,
    uniqueTaskCount: 0,
    inputType: TextType.UNKNOWN,
  };
  selectedOverlord: ExtendedTask | null = null;
  isAutoParse = true;
  isFunctionsWithTypes = true;
  isLongNamesShortened: boolean = true;
  isFilterUniques: boolean = true;

  constructor(
    private inputToTasksService: InputToTasksService,
    private utilityService: TaskUtilityService,
    private taskBatchService: TaskBatchService
  ) {}

  ngOnInit() {
    this.selectedOverlord = { name: 'Default Overlord' } as ExtendedTask;

    this.utilityService.getSelectedOverlord().subscribe((t) => {
      if (!t) return;
      this.selectedOverlord = t;
    });
  }

  onInputChange(): void {
    if (this.isAutoParse) {
      this.parseTasks();
    }
  }

  parseTasks(): void {
    this.inputToTasksService.setInput(
      this.inputText,
      this.isAutoParse,
      this.isFunctionsWithTypes,
      this.isLongNamesShortened
    );
    // this.updateSummary();
    this.taskSummary = this.inputToTasksService.getTaskSummary();
    this.tasks = this.inputToTasksService
      .parseTasks(this.isFunctionsWithTypes, this.isLongNamesShortened)
      .map((task) => ({
        ...task,
        taskId: task.taskId === '0' ? this.generateUniqueId() : task.taskId,
      }));

    if (this.isFilterUniques) {
      this.filterUniques();
    }
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  filterUniques(): void {
    const uniqueTaskNames = new Set<string>();
    this.tasks = this.tasks.filter((task) => {
      if (uniqueTaskNames.has(task.name)) {
        return false; // Duplicate, exclude from filtered list
      }
      uniqueTaskNames.add(task.name); // Mark this name as seen
      return true; // Unique, include in filtered list
    });
  }

  importTasks(): void {
    if (!this.selectedOverlord) {
      alert('Select Overlord in search before creating tasks!');
    } else {
      this.taskBatchService.createTaskBatch(
        this.tasks,
        this.selectedOverlord.taskId
      );
    }
  }

  clearInput(): void {
    this.inputText = '';
    this.tasks = [];
    this.taskSummary = { taskCount: 0, uniqueTaskCount: 0, inputType: null };
  }
}
