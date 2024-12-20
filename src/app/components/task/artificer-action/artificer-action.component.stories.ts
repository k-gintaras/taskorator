import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { ArtificerActionComponent } from './artificer-action.component';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { ArtificerService } from '../../artificer/artificer.service';
import { TaskUpdateService } from '../../../services/task/task-update.service';
import { SelectedMultipleService } from '../../../services/task/selected-multiple.service';
import { GptSuggestService } from '../../../services/tasks/gpt-suggest.service';
import { Task } from '../../../models/taskModelManager';
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
  complete(task: Task) {
    console.log('Mock: Completed task:', task);
  }
  delete(task: Task) {
    console.log('Mock: Deleted task:', task);
  }
  increasePriority(task: Task) {
    console.log('Mock: Increased priority:', task);
  }
  decreasePriority(task: Task) {
    console.log('Mock: Decreased priority:', task);
  }
  renew(task: Task) {
    console.log('Mock: Renewed task:', task);
  }
  move(task: Task) {
    console.log('Mock: Moved task:', task);
  }
}

class MockSelectedMultipleService {
  addRemoveSelectedTask(task: Task) {
    console.log('Mock: Selected/Unselected task:', task);
  }
  isSelected(task: Task): boolean {
    return false;
  }
}

class MockGptSuggestService {
  suggestTasksForTask(task: Task) {
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
  },
  treeNode: {
    overlord: '1',
    childrenCount: 0,
    completedChildrenCount: 0,
    isCompleted: false,
  },
};
