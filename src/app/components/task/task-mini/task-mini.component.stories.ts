import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { TaskMiniComponent } from './task-mini.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SelectedMultipleService } from '../../../services/tasks/selected-multiple.service';
import { SelectedTaskService } from '../../../services/tasks/selected-task.service';
import { Task } from '../../../models/taskModelManager';

// Mock Services
class MockSelectedMultipleService {
  private selectedTasks = new Set<string>();

  addRemoveSelectedTask(task: Task) {
    if (this.selectedTasks.has(task.taskId)) {
      this.selectedTasks.delete(task.taskId);
    } else {
      this.selectedTasks.add(task.taskId);
    }
  }

  isSelected(task: Task) {
    return this.selectedTasks.has(task.taskId);
  }
}

class MockSelectedTaskService {
  private selectedTask: Task | null = null;

  setSelectedTask(task: Task) {
    this.selectedTask = task;
  }

  getSelectedTask(): Task | null {
    return this.selectedTask;
  }
}

// Story Configuration
export default {
  title: 'Components/Task Mini',
  component: TaskMiniComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatIconModule],
      providers: [
        {
          provide: SelectedMultipleService,
          useClass: MockSelectedMultipleService,
        },
        { provide: SelectedTaskService, useClass: MockSelectedTaskService },
      ],
    }),
  ],
} as Meta<TaskMiniComponent>;

// Story Template
const Template: StoryFn<TaskMiniComponent> = (args) => ({
  props: args,
});

// Default Story
export const Default = Template.bind({});
Default.args = {
  task: {
    taskId: '1',
    name: 'Test Task',
    todo: 'Complete the assignment',
    why: 'To learn Storybook',
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
    tags: ['test', 'storybook'],
  },
  overlord: {
    taskId: '128',
    name: 'Overlord Task',
    todo: '',
    why: 'Root of all tasks',
    timeCreated: Date.now(),
    lastUpdated: Date.now(),
    timeEnd: null,
    duration: 0,
    overlord: null,
    repeat: 'never',
    status: 'active',
    stage: 'todo',
    type: 'task',
    subtype: '',
    size: 'do now',
    owner: '',
    priority: 1,
    backupLink: '',
    imageUrl: null,
    imageDataUrl: null,
    tags: ['overlord'],
  },
};
