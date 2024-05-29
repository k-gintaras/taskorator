import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { Task, getDefaultTask } from '../../models/taskModelManager';
import { SelectedOverlordService } from '../../services/task/selected-overlord.service';
import { TaskService } from '../../services/task/task.service';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { SearchOverlordComponent } from '../search-overlord/search-overlord.component';

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
  selectedOverlord$: Observable<Task | null>;
  selectedOverlordName: string = '';
  showAdditionalFields = false;

  constructor(
    private fb: FormBuilder,
    private selectedOverlordService: SelectedOverlordService,
    private taskService: TaskService
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
        this.selectedOverlordName = overlord.name;
      }
    });
  }

  toggleAdditionalFields(): void {
    this.showAdditionalFields = !this.showAdditionalFields;
  }

  async createTask(): Promise<void> {
    if (this.taskForm.valid) {
      const task: Task = getDefaultTask();
      const overlord = this.selectedOverlordService.getSelectedOverlord();

      if (overlord) {
        task.name = this.taskForm.get('name')?.value;

        if (this.showAdditionalFields) {
          task.todo = this.taskForm.get('todo')?.value;
          task.why = this.taskForm.get('why')?.value;
          // task.duration = this.taskForm.get('duration')?.value;
        }

        task.overlord = overlord.taskId;

        await this.taskService.createTask(task);
        this.taskForm.reset();
      } else {
        console.error('No overlord selected');
      }
    }
  }
}
