import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { ArtificerActionComponent } from './artificer-action.component';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { ArtificerService } from '../../artificer/artificer.service';
import { TaskUpdateService } from '../../../services/tasks/task-update.service';
import { SelectedMultipleService } from '../../../services/tasks/selected/selected-multiple.service';
import { GptSuggestService } from '../../../features/gpt/services/gpt-suggest.service';
import { TaskoratorTask } from '../../../models/taskModelManager';
import { ArtificerDetails } from '../../artificer/artificer.interface';

// Mock Services
class MockArtificerService {
  currentAction$ = of({
    action: 'todo',
    icon: 'check',
    colorClass: 'complete-icon-color',
  } as ArtificerDetails);
}

class MockTaskUpdateService {
  complete(task: TaskoratorTask) {
    console.log('Mock: Completed task:', task);
  }
  delete(task: TaskoratorTask) {
    console.log('Mock: Deleted task:', task);
  }
  increasePriority(task: TaskoratorTask) {
    console.log('Mock: Increased priority:', task);
  }
  decreasePriority(task: TaskoratorTask) {
    console.log('Mock: Decreased priority:', task);
  }
  renew(task: TaskoratorTask) {
    console.log('Mock: Renewed task:', task);
  }
  move(task: TaskoratorTask) {
    console.log('Mock: Moved task:', task);
  }
}

class MockSelectedMultipleService {
  addRemoveSelectedTask(task: TaskoratorTask) {
    console.log('Mock: Selected/Unselected task:', task);
  }
  isSelected(task: TaskoratorTask): boolean {
    return false;
  }
}

class MockGptSuggestService {
  suggestTasksForTask(task: TaskoratorTask) {
    console.log('Mock: Suggested tasks for:', task);
  }
}

// Story Configuration
export default {
  title: 'Components/Artificer Action',
  component: ArtificerActionComponent,
  decorators: [
    moduleMetadata({
      imports: [MatIconModule],
      providers: [
        { provide: ArtificerService, useClass: MockArtificerService },
        { provide: TaskUpdateService, useClass: MockTaskUpdateService },
        {
          provide: SelectedMultipleService,
          useClass: MockSelectedMultipleService,
        },
        { provide: GptSuggestService, useClass: MockGptSuggestService },
      ],
    }),
  ],
} as Meta<ArtificerActionComponent>;

// Story Template
const Template: StoryFn<ArtificerActionComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {
  task: {
    taskId: '1',
    name: 'Sample Task',
    todo: 'Complete this task',
    why: 'To test functionality',
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
    tags: ['test', 'storybook'],
    isSelected: false,
    isRecentlyViewed: false,
    completionPercent: 0,
    color: '',
    views: 0,
    isRecentlyUpdated: false,
    isRecentlyCreated: false,
    children: 0,
    completedChildren: 0,
    secondaryColor: '',
    magnitude: 0,
    isConnectedToTree: false,
  },
  treeNode: {
    overlord: '1',
    childrenCount: 0,
    completedChildrenCount: 0,
    stage: 'todo',
    taskId: '',
    connected: false,
  },
};
