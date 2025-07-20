import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable } from 'rxjs';
import {
  TaskoratorTask,
  UiTask,
  getDefaultTask,
} from '../../../models/taskModelManager';
import { SelectedOverlordService } from '../../../services/tasks/selected/selected-overlord.service';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { SearchOverlordComponent } from '../../search-overlord/search-overlord.component';
import { TaskService } from '../../../services/sync-api-cache/task.service';
import { TaskUpdateService } from '../../../services/tasks/task-update.service';

/**
 * @deprecated OR NOT??? just use search-create component for simple task creation, or not?
 * todo: consider if this is useful when we want to create task with more details
 */
@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIcon,
    SearchOverlordComponent,
  ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss',
})
export class CreateTaskComponent {
  taskForm: FormGroup;
  selectedOverlord$: Observable<UiTask | null>;
  selectedOverlordName: string = '';
  showAdditionalFields = false;

  constructor(
    private fb: FormBuilder,
    private selectedOverlordService: SelectedOverlordService,
    private taskService: TaskService,
    private taskUpdateService: TaskUpdateService
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      todo: [''],
      why: [''],
      // duration: [''],
    });

    this.selectedOverlord$ =
      this.selectedOverlordService.getSelectedOverlordObservable();
  }

  ngOnInit(): void {
    this.selectedOverlord$.subscribe((overlord) => {
      if (overlord) {
        this.taskService
          .getTaskById(overlord.taskId)
          .then((t) => (this.selectedOverlordName = t?.name || ''));
      }
    });
  }

  toggleAdditionalFields(): void {
    this.showAdditionalFields = !this.showAdditionalFields;
  }

  async createTask(): Promise<void> {
    if (this.taskForm.valid) {
      const task: TaskoratorTask = getDefaultTask();
      const overlord: UiTask | null =
        this.selectedOverlordService.getSelectedOverlord();

      if (overlord) {
        task.name = this.taskForm.get('name')?.value;

        if (this.showAdditionalFields) {
          task.todo = this.taskForm.get('todo')?.value;
          task.why = this.taskForm.get('why')?.value;
          // task.duration = this.taskForm.get('duration')?.value;
        }

        task.overlord = overlord.taskId;

        await this.taskUpdateService.create(task);
        this.taskForm.reset();
      } else {
        console.error('No overlord selected');
      }
    }
  }
}
