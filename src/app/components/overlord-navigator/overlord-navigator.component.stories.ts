import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { OverlordNavigatorComponent } from './overlord-navigator.component';
import { MatIconModule } from '@angular/material/icon';
import { SearchOverlordComponent } from '../search-overlord/search-overlord.component';
import { of } from 'rxjs';
import { ExtendedTask } from '../../models/taskModelManager';
import { TaskListRules } from '../../models/task-list-model';
import { SelectedOverlordService } from '../../services/tasks/selected-overlord.service';
import { SelectedListService } from '../../services/tasks/selected-list.service';
import { TaskListRulesService } from '../../services/tasks/task-list-rules.service';
import { TaskNavigatorUltraService } from '../../services/tasks/task-navigator-ultra.service';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Mock Services
class MockSelectedOverlordService {
  getSelectedOverlordObservable() {
    return of('mock-task-id'); // Mock selected overlord ID
  }
}

class MockTaskNavigatorUltraService {
  previous(taskId: string) {
    console.log(`Navigating to super parent of task ${taskId}`);
  }
  backToPrevious() {
    console.log('Navigating back to previous task.');
  }
  next(taskId: string) {
    console.log(`Navigating to child tasks of ${taskId}`);
  }
  backToStart() {
    console.log('Navigating back to root.');
  }
}

class MockTaskService {
  getTaskById(taskId: string): Promise<ExtendedTask | null> {
    return Promise.resolve({
      taskId: 'mock-task-id',
      name: 'Mock Task',
      todo: 'Mock TODO',
      why: 'Mock WHY',
      timeCreated: Date.now(),
      lastUpdated: Date.now(),
      timeEnd: null,
      duration: 60,
      overlord: null,
      repeat: 'once',
      status: 'active',
      stage: 'todo',
      type: 'todo',
      subtype: 'list',
      size: 'do now',
      owner: 'mock-owner',
      priority: 5,
      backupLink: '',
      imageUrl: null,
      imageDataUrl: null,
      tags: [],
      isVisible: true,
      animationState: 'normal',
    });
  }
}

class MockSelectedListService {
  selectedListKey$ = of(null); // Mock selected list
}

class MockTaskListRulesService {
  getList() {
    return {
      title: 'Mock List',
      description: 'Mock List Description',
    } as TaskListRules;
  }
}

// Story Configuration
export default {
  title: 'Components/Overlord Navigator',
  component: OverlordNavigatorComponent,
  decorators: [
    moduleMetadata({
      imports: [
        MatIconModule,
        SearchOverlordComponent,
        BrowserAnimationsModule, // Required for Angular animations
      ],
      providers: [
        {
          provide: SelectedOverlordService,
          useClass: MockSelectedOverlordService,
        },
        {
          provide: TaskNavigatorUltraService,
          useClass: MockTaskNavigatorUltraService,
        },
        { provide: TaskService, useClass: MockTaskService },
        { provide: SelectedListService, useClass: MockSelectedListService },
        { provide: TaskListRulesService, useClass: MockTaskListRulesService },
      ],
    }),
  ],
} as Meta<OverlordNavigatorComponent>;

// Story Template
const Template: StoryFn<OverlordNavigatorComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {};
