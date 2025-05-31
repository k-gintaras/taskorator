import { AsyncPipe, CommonModule } from '@angular/common';
import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { StagedTaskListComponent } from './staged-task-list.component';
import { TaskMiniComponent } from '../task-mini/task-mini.component';
import { MatIcon } from '@angular/material/icon';
import { getRandomTasks } from '../../../test-files/test-data/test-task';

// Story Configuration
export default {
  title: 'Components/StagedTaskList',
  component: StagedTaskListComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AsyncPipe, TaskMiniComponent, MatIcon],
      providers: [
        // { provide: StagedTasksService, useClass: StagedTasksService },
      ],
    }),
  ],
} as Meta<StagedTaskListComponent>;

// Story Template
const Template: StoryFn<StagedTaskListComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {
  tasks: getRandomTasks(),
};
