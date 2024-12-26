import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { getRandomTask } from '../../../test-files/test-data/test-task';
import { TaskCardComponent } from './task-card.component';
import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { getBaseTask, getDefaultTask } from '../../../models/taskModelManager';

export default {
  title: 'Components/Task Card',
  component: TaskCardComponent,
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
      // providers: [{ provide: TaskUpdateService, useClass: MockTaskService }],
    }),
  ],
} as Meta<TaskCardComponent>;

// Story Template
const Template: StoryFn<TaskCardComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {
  task: getRandomTask(),
};
