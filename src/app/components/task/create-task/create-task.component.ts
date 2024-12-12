import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { Task, getDefaultTask } from '../../../models/taskModelManager';
import { SelectedOverlordService } from '../../../services/task/selected-overlord.service';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { SearchOverlordComponent } from '../../search-overlord/search-overlord.component';
import { TaskService } from '../../../services/tasks/task.service';
import { TaskUpdateService } from '../../../services/task/task-update.service';

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
  selectedOverlord$: Observable<string | null>;
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
          .getTaskById(overlord)
          .then((t) => (this.selectedOverlordName = t?.name || ''));
      }
    });
  }

  toggleAdditionalFields(): void {
    this.showAdditionalFields = !this.showAdditionalFields;
  }

  async createTask(): Promise<void> {
    if (this.taskForm.valid) {
      const task: Task = getDefaultTask();
      const overlord: string | null =
        this.selectedOverlordService.getSelectedOverlord();

      if (overlord) {
        task.name = this.taskForm.get('name')?.value;

        if (this.showAdditionalFields) {
          task.todo = this.taskForm.get('todo')?.value;
          task.why = this.taskForm.get('why')?.value;
          // task.duration = this.taskForm.get('duration')?.value;
        }

        task.overlord = overlord;

        await this.taskUpdateService.create(task);
        this.taskForm.reset();
      } else {
        console.error('No overlord selected');
      }
    }
  }
}
