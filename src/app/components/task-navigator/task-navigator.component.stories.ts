import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { TaskNavigatorComponent } from './task-navigator.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ArtificerComponent } from '../artificer/artificer.component';
import { ArtificerActionComponent } from '../task/artificer-action/artificer-action.component';
import { TaskMiniComponent } from '../task/task-mini/task-mini.component';
import { OverlordNavigatorComponent } from '../overlord-navigator/overlord-navigator.component';
import { of } from 'rxjs';
import { TaskViewService } from '../../services/tasks/task-view.service';
import { SelectedMultipleService } from '../../services/task/selected-multiple.service';
import { TaskNavigatorUltraService } from '../../services/tasks/task-navigator-ultra.service';
import { TreeService } from '../../services/core/tree.service';
import { ExtendedTask, Task } from '../../models/taskModelManager';
import { TaskNavigatorTestComponent } from './task-navigator-test/task-navigator-test.component';

// Mock Services
class MockTaskViewService {
  tasks$ = of([
    {
      taskId: '1',
      name: 'Task 1',
      todo: 'Do this task',
      why: 'Because it’s important',
      timeCreated: Date.now(),
      lastUpdated: Date.now(),
      timeEnd: null,
      duration: 30,
      overlord: '128',
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
      tags: ['tag1'],
    },
  ] as ExtendedTask[]);
}

// class MockSelectedMultipleService {
//   getSelectedTasks() {
//     return of([]);
//   }
// }

class MockTaskNavigatorUltraService {
  async next(taskId: string) {
    console.log(`Navigated to next tasks of ${taskId}`);
  }

  async backToStart() {
    console.log('Navigated back to the start');
  }

  async backToPrevious() {
    console.log('Navigated back to the previous tasks');
  }
}

class MockTreeService {
  getTaskTreeData(taskId: string) {
    return {
      taskId: taskId,
      name: `Task ${taskId}`,
      children: [],
      isCompleted: false,
      overlord: null,
      childrenCount: 0,
      completedChildrenCount: 0,
    };
  }
}

// Story Configuration
export default {
  title: 'Components/Task Navigator',
  component: TaskNavigatorTestComponent,
  decorators: [
    moduleMetadata({
      imports: [
        MatCardModule,
        MatIconModule,
        CommonModule,
        TaskMiniComponent,
        ArtificerActionComponent,
        ArtificerComponent,
        OverlordNavigatorComponent,
      ],
      providers: [
        { provide: TaskViewService, useClass: MockTaskViewService },
        {
          provide: SelectedMultipleService,
          useClass: SelectedMultipleService,
        },
        {
          provide: TaskNavigatorUltraService,
          useClass: MockTaskNavigatorUltraService,
        },
        { provide: TreeService, useClass: MockTreeService },
      ],
    }),
  ],
} as Meta<TaskNavigatorComponent>;

// Story Template
const Template: StoryFn<TaskNavigatorComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {
  showArtificer: true,
};
