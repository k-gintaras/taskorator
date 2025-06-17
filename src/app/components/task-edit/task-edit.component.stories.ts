import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { TaskEditComponent } from './task-edit.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { getRandomTask } from '../../test-files/test-data/test-task';
import { TaskActions } from '../../services/tasks/task-action-tracker.service';
import { TaskUpdateService } from '../../services/tasks/task-update.service';
import { MatIcon } from '@angular/material/icon';
import { TaskoratorTask } from '../../models/taskModelManager';

// Mock Services
class MockTaskService {
  getTaskDetails() {
    return of(getRandomTask());
  }
  update(task: TaskoratorTask, action: TaskActions) {
    console.log('task Saved');
    console.log(task.name);
    console.log(action);
    return;
  }
}

export default {
  title: 'Components/Task Edit',
  component: TaskEditComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        MatIcon,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatCardModule,
        ReactiveFormsModule,
      ],
      providers: [{ provide: TaskUpdateService, useClass: MockTaskService }],
    }),
  ],
} as Meta<TaskEditComponent>;

// Story Template
const Template: StoryFn<TaskEditComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {
  task: getRandomTask(),
};
