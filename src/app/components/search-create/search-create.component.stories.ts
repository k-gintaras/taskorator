import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { SearchCreateComponent } from './search-create.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { TaskTreeNode } from '../../models/taskTree';
import { SelectedOverlordService } from '../../services/tasks/selected-overlord.service';
import { SearchTasksService } from '../../services/tasks/search-tasks.service';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { getDefaultTask, Task } from '../../models/taskModelManager';
import { MatIcon } from '@angular/material/icon';
import { getRandomTask } from '../../test-files/test-data/test-task';

// Mock Services
class MockTaskService {
  createTask(task: Task) {
    console.log(task.name + ' created');
    return Promise.resolve(task);
  }
  getTaskById(id: string) {
    console.log('getting task: ' + id);

    const t = getRandomTask();
    t.name = 'qq';
    return Promise.resolve(t);
  }
}
class MockTaskSearchService {
  private mockTree: TaskTreeNode[] = [
    {
      taskId: '1',
      name: 'Root Task',
      isCompleted: false,
      overlord: null,
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
    },
    {
      taskId: '2',
      name: 'Child Task 1',
      isCompleted: false,
      overlord: '1',
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
    },
    {
      taskId: '3',
      name: 'Child Task 2',
      isCompleted: true,
      overlord: '1',
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
    },
  ];

  searchTasks(query: string) {
    const lowerCaseQuery = query.toLowerCase();
    const filteredTasks = this.mockTree.filter((task) =>
      task.name.toLowerCase().includes(lowerCaseQuery)
    );
    return of(filteredTasks);
  }
}

class MockSelectedOverlordService {
  setSelectedOverlord(taskId: string) {
    console.log(`Selected overlord task ID: ${taskId}`);
  }

  getSelectedOverlordObservable() {
    return of(getDefaultTask());
  }
}

// Story Configuration
export default {
  title: 'Components/Search Create',
  component: SearchCreateComponent,
  decorators: [
    moduleMetadata({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIcon,
        MatButton,
        ReactiveFormsModule,
        NoopAnimationsModule, // Simplifies animations for Storybook
      ],
      providers: [
        { provide: TaskService, useClass: MockTaskService },
        { provide: SearchTasksService, useClass: MockTaskSearchService },
        {
          provide: SelectedOverlordService,
          useClass: SelectedOverlordService,
        },
      ],
    }),
  ],
} as Meta<SearchCreateComponent>;

// Story Template
const Template: StoryFn<SearchCreateComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {};
