import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { of } from 'rxjs';
import { TaskUpdateService } from '../../../services/task/task-update.service';
import { SettingsService } from '../../../services/core/settings.service';
import {
  getButtonMatName,
  getDefaultTaskSettings,
  TaskSettings,
} from '../../../models/settings';
import { TaskActionComponent } from './action.component';

// Mock Services
class MockTaskUpdateService {
  complete(task: any) {
    console.log('Mock: Completed task:', task);
  }
  archive(task: any) {
    console.log('Mock: Archived task:', task);
  }
  delete(task: any) {
    console.log('Mock: Deleted task:', task);
  }
  renew(task: any) {
    console.log('Mock: Renewed task:', task);
  }
  setAsSeen(task: any) {
    console.log('Mock: Seen task:', task);
  }
}

class MockSettingsService {
  getSettings() {
    return of(getDefaultTaskSettings());
  }
}

// Story Configuration
export default {
  title: 'Components/Task Action',
  component: TaskActionComponent,
  decorators: [
    moduleMetadata({
      imports: [MatIconModule, MatButtonModule],
      providers: [
        { provide: TaskUpdateService, useClass: MockTaskUpdateService },
        { provide: SettingsService, useClass: MockSettingsService },
      ],
    }),
  ],
} as Meta<TaskActionComponent>;

// Story Template
const Template: StoryFn<TaskActionComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {
  task: {
    taskId: '1',
    name: 'Test Task',
    todo: 'Do this task',
    why: 'Because it is important',
    timeCreated: Date.now(),
    lastUpdated: Date.now(),
    timeEnd: null,
    duration: 60,
    overlord: null,
    repeat: 'once',
    status: 'active',
    stage: 'todo',
    type: 'task',
    subtype: '',
    size: 'do now',
    owner: '',
    priority: 5,
    backupLink: '',
    imageUrl: null,
    imageDataUrl: null,
    tags: [],
  },
  settings: {
    completeButtonAction: 'completed',
  } as TaskSettings,
};
