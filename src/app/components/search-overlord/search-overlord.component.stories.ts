import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { SearchOverlordComponent } from './search-overlord.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Use NoopAnimationsModule for simplicity
import { TaskTreeNode } from '../../models/taskTree';
import { TaskoratorTask } from '../../models/taskModelManager';
import { AuthService } from '../../services/core/auth.service';
import { TreeNodeService } from '../../services/tree/tree-node.service';
import { TreeService } from '../../services/sync-api-cache/tree.service';
import { SelectedOverlordService } from '../../services/tasks/selected-overlord.service';
import { TaskService } from '../../services/sync-api-cache/task.service';

// Mock Services
class MockTreeService {
  getTree() {
    return of({
      id: '1',
      name: 'Root Task',
      children: [
        { id: '2', name: 'Child Task 1', children: [], isCompleted: false },
        { id: '3', name: 'Child Task 2', children: [], isCompleted: true },
      ],
    });
  }
}

class MockTreeNodeService {
  getFlattened(tree: any): TaskTreeNode[] {
    return [
      {
        taskId: '1',
        name: 'Root Task',
        children: [],
        overlord: null,
        childrenCount: 0,
        completedChildrenCount: 0,
        connected: false,
        stage: 'todo',
      },
      {
        taskId: '2',
        name: 'Child Task 1',
        children: [],
        overlord: null,
        childrenCount: 0,
        completedChildrenCount: 0,
        connected: false,
        stage: 'todo',
      },
      {
        taskId: '3',
        name: 'Child Task 2',
        children: [],
        overlord: null,
        childrenCount: 0,
        completedChildrenCount: 0,
        connected: false,
        stage: 'todo',
      },
    ];
  }
}

class MockSelectedOverlordService {
  setSelectedOverlord(taskId: string) {
    console.log(`Selected overlord: ${taskId}`);
  }
}

class MockTaskService {
  getTaskById(taskId: string): Promise<TaskoratorTask | null> {
    if (taskId === '1') {
      return Promise.resolve({
        taskId: '1',
        name: 'Root Task',
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
        type: 'todo',
        subtype: 'list',
        size: 'do now',
        owner: '',
        priority: 5,
        backupLink: '',
        imageUrl: null,
        imageDataUrl: null,
        tags: [],
      });
    }
    return Promise.resolve(null);
  }
}

class MockAuthService {
  isAuthenticatedObservable() {
    return of(true); // Simulate an authenticated state
  }
}

// Story Configuration
export default {
  title: 'Components/Search Overlord',
  component: SearchOverlordComponent,
  decorators: [
    moduleMetadata({
      imports: [
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        ReactiveFormsModule,
        NgxMatSelectSearchModule,
        NoopAnimationsModule, // Use NoopAnimationsModule to disable animations
      ],
      providers: [
        { provide: TreeService, useClass: MockTreeService },
        { provide: TreeNodeService, useClass: MockTreeNodeService },
        {
          provide: SelectedOverlordService,
          useClass: MockSelectedOverlordService,
        },
        { provide: TaskService, useClass: MockTaskService },
        { provide: AuthService, useClass: MockAuthService },
      ],
    }),
  ],
} as Meta<SearchOverlordComponent>;

// Story Template
const Template: StoryFn<SearchOverlordComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {};
