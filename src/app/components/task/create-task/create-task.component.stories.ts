import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { CreateTaskComponent } from './create-task.component';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SearchOverlordComponent } from '../../search-overlord/search-overlord.component';
import { TaskService } from '../../../services/sync-api-cache/task.service';
import { TaskUpdateService } from '../../../services/tasks/task-update.service';
import { SelectedOverlordService } from '../../../services/tasks/selected/selected-overlord.service';

// Mock Services
class MockTaskService {
  getTaskById(taskId: string) {
    return Promise.resolve({
      taskId,
      name: `Mock Task ${taskId}`,
      todo: '',
      why: '',
      timeCreated: Date.now(),
      lastUpdated: Date.now(),
      timeEnd: null,
      duration: 0,
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
    });
  }
}

class MockSelectedOverlordService {
  getSelectedOverlordObservable() {
    return of('123');
  }
  getSelectedOverlord() {
    return '123';
  }
}

class MockTaskUpdateService {
  create(task: any) {
    console.log('Mock task created:', task);
  }
}

// Story Configuration
export default {
  title: 'Components/Create Task',
  component: CreateTaskComponent,
  decorators: [
    moduleMetadata({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        SearchOverlordComponent,
      ],
      providers: [
        FormBuilder,
        { provide: TaskService, useClass: MockTaskService },
        { provide: TaskUpdateService, useClass: MockTaskUpdateService },
        {
          provide: SelectedOverlordService,
          useClass: MockSelectedOverlordService,
        },
      ],
    }),
  ],
} as Meta<CreateTaskComponent>;

// Story Template
const Template: StoryFn<CreateTaskComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {};
