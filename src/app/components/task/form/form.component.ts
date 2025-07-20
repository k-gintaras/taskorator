import { Component, Input } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TaskoratorTask } from '../../../models/taskModelManager';
import { MatFormField, MatLabel } from '@angular/material/form-field';

/**
 * @deprecated was probably an idea to create a form for task creation or editing,
 * but now we have task-edit component that uses this form for editing tasks.
 */
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [MatFormField, MatLabel, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  @Input() taskToClone?: TaskoratorTask; // Optional task to initialize form with
  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      todo: [''],
      why: [''],
      // Other fields can be added here as needed
    });
  }

  ngOnInit(): void {
    // Populate form with task details if `taskToClone` is provided
    if (this.taskToClone) {
      this.initializeFormWithTask(this.taskToClone);
    }
  }

  // Populate form fields based on the given task
  initializeFormWithTask(task: TaskoratorTask): void {
    this.taskForm.patchValue({
      name: '', // Keep name empty for user to specify a unique name
      todo: task.todo || '',
      why: task.why || '',
      // Add other fields as needed
    });
  }

  // Get the form values to create or update a task
  getTaskDetails(): Partial<TaskoratorTask> {
    return this.taskForm.value;
  }
}
