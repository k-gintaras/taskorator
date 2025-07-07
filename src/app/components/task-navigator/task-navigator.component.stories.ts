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
import { SelectedMultipleService } from '../../services/tasks/selected/selected-multiple.service';
import { TaskNavigatorUltraService } from '../../services/tasks/task-navigation/task-navigator-ultra.service';
import { TreeService } from '../../services/sync-api-cache/tree.service';
import { ColorService } from '../../services/utils/color.service';
import { TaskStatusService } from '../../services/tasks/task-status.service';
import { SelectedOverlordService } from '../../services/tasks/selected/selected-overlord.service';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { ErrorService } from '../../services/core/error.service';
import { ExtendedTask } from '../../models/taskModelManager';
import { getRandomTasks } from '../../test-files/test-data/test-task';
import { GptSuggestService } from '../../features/gpt/services/gpt-suggest.service';
import { GptRequestService } from '../../features/gpt/services/gpt-request.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TaskNodeInfo } from '../../models/taskTree';

// ✅ Mocks

class MockSelectedOverlordService {
  getSelectedOverlordObservable() {
    return of(null);
  }
}

class MockGptSuggestService {}
class MockGptRequestService {}

class MockTaskViewService {
  tasks$ = of(
    getRandomTasks().map((t) => ({
      ...t,
      tags: ['tag-' + Math.floor(Math.random() * 10)],
      priority: Math.floor(Math.random() * 10),
    }))
  );
}

class MockSelectedMultipleService {
  getSelectedTasks() {
    return of([]);
  }
}

class MockTaskNavigatorUltraService {
  async next(taskId: string) {
    console.log(`Navigated to next tasks of ${taskId}`);
  }
  async backToStart() {
    console.log('Navigated back to start');
  }
  async backToPrevious() {
    console.log('Navigated back to previous');
  }
}

class MockTreeService {
  getTaskTreeData() {
    return null;
  }
}

class MockColorService {
  getDateBasedColor(timestamp: number): string {
    // simple light pastel cycling
    const colors = ['#fca5a5', '#fdba74', '#fcd34d', '#86efac', '#93c5fd'];
    return colors[timestamp % colors.length];
  }

  getProgressPercent(): number {
    return Math.floor(Math.random() * 100);
  }

  getAgeColor(): string {
    return '#999'; // gray fallback
  }
}
class MockTaskStatusService {
  getStatus(id: string): string {
    return 'normal';
  }

  getProgressPercent(node: TaskNodeInfo | null): number {
    let percent = Math.floor(Math.random() * 100);
    // prevent ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {}, 0);
    return percent;
  }

  getAgeColor(): string {
    return '#999'; // gray fallback
  }
}

class DummyService {}

// ✅ Story Config
export default {
  title: 'Components/Task Navigator',
  component: TaskNavigatorComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        HttpClientTestingModule, // ⬅ satisfies HttpClient if anything still needs it
        TaskMiniComponent,
        ArtificerComponent,
        ArtificerActionComponent,
        OverlordNavigatorComponent,
      ],
      providers: [
        { provide: TaskViewService, useClass: MockTaskViewService },
        {
          provide: TaskNavigatorUltraService,
          useClass: MockTaskNavigatorUltraService,
        },
        { provide: TreeService, useClass: MockTreeService },
        {
          provide: SelectedOverlordService,
          useClass: MockSelectedOverlordService,
        },
        { provide: GptSuggestService, useClass: MockGptSuggestService },
        { provide: GptRequestService, useClass: MockGptRequestService },
        // unchanged dummies
        { provide: ColorService, useClass: DummyService },
        { provide: TaskStatusService, useClass: MockTaskStatusService },
        { provide: TaskService, useClass: DummyService },
        { provide: ErrorService, useClass: DummyService },
        { provide: ColorService, useClass: MockColorService },
      ],
    }),
  ],
} as Meta<TaskNavigatorComponent>;

// ✅ Template
const Template: StoryFn<TaskNavigatorComponent> = (args) => ({
  props: args,
});

// ✅ Default Story
export const Default = Template.bind({});
Default.args = {
  showArtificer: true,
};
