import { AsyncPipe, CommonModule } from '@angular/common';
import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { InputToTasksComponent } from './input-to-tasks.component';
import { StagedTaskListComponent } from '../../../../../components/task/staged-task-list/staged-task-list.component';
import {
  getRandomTask,
  getRandomTasks,
} from '../../../../../test-files/test-data/test-task';
import { TaskUtilityService } from '../../../../../services/tasks/task-utility.service';
import { of } from 'rxjs/internal/observable/of';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormField } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TaskBatchService } from '../../../../../services/sync-api-cache/task-batch.service';

class MockTaskUtilityService {
  getSelectedOverlord() {
    return of(getRandomTask());
  }
}
class MockTaskBatchService {
  createTaskBatch(tasks: Task[], overlordId: string) {
    console.log('batch created');
    return;
  }
}
// Story Configuration
export default {
  title: 'Components/InputToTasks',
  component: InputToTasksComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        StagedTaskListComponent,
        FormsModule,
        MatFormField,
        MatButtonModule,
        MatIcon,
        NoopAnimationsModule,
        MatInputModule,
      ],
      providers: [
        { provide: TaskUtilityService, useClass: MockTaskUtilityService },
        { provide: TaskBatchService, useClass: MockTaskBatchService },
      ],
    }),
  ],
} as Meta<InputToTasksComponent>;

// Story Template
const Template: StoryFn<InputToTasksComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {
  tasks: getRandomTasks(),
};
