import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { ArtificerComponent } from './artificer.component';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';
import { ArtificerService } from './artificer.service';
import { artificerDetailList, ArtificerDetails } from './artificer.interface';
import { TaskoratorTask } from '../../models/taskModelManager';

class MockArtificerService {
  private actions: ArtificerDetails[] = artificerDetailList;
  private currentActionSubject = new BehaviorSubject<ArtificerDetails>(
    this.actions[0]
  );
  currentAction$ = this.currentActionSubject.asObservable();
  selectedTasks: TaskoratorTask[] = []; // Simulate selected tasks

  // Returns available actions
  getActions(): ArtificerDetails[] {
    return this.actions;
  }

  // Set the current action
  setCurrentAction(action: ArtificerDetails): void {
    this.currentActionSubject.next(action);
  }

  // Simulated action methods
  delete(task: TaskoratorTask): void {
    console.log(`Deleted task: ${task.name}`);
  }

  complete(task: TaskoratorTask): void {
    console.log(`Completed task: ${task.name}`);
  }

  refresh(task: TaskoratorTask): void {
    console.log(`Refreshed task: ${task.name}`);
  }

  moveSelectedInto(task: TaskoratorTask): void {
    console.log(`Moved selected tasks into task: ${task.name}`);
  }

  split(task: TaskoratorTask): void {
    console.log(`Split task: ${task.name}`);
  }

  crush(task: TaskoratorTask): void {
    console.log(`Crushed selected tasks into task: ${task.name}`);
  }

  merge(task: TaskoratorTask): void {
    console.log(`Merged selected tasks into task: ${task.name}`);
  }

  extract(task: TaskoratorTask): void {
    console.log(`Extracted tasks from: ${task.name}`);
  }

  clearSelected(): void {
    this.selectedTasks = [];
    console.log(`Cleared selected tasks`);
  }

  selectAll(): void {
    console.log(`Selected all tasks in the current view`);
  }

  edit(task: TaskoratorTask): void {
    console.log(`Editing task: ${task.name}`);
  }

  promote(task: TaskoratorTask): void {
    console.log(`Promoted task: ${task.name}`);
  }

  demote(task: TaskoratorTask): void {
    console.log(`Demoted task: ${task.name}`);
  }

  select(task: TaskoratorTask): void {
    console.log(`Selected task: ${task.name}`);
  }

  suggest(task: TaskoratorTask): void {
    console.log(`Suggested actions for task: ${task.name}`);
  }
}

export default {
  title: 'Components/Artificer',
  component: ArtificerComponent,
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule, MatIconModule],
      providers: [
        { provide: ArtificerService, useClass: MockArtificerService },
      ],
    }),
  ],
} as Meta<ArtificerComponent>;

const Template: StoryFn<ArtificerComponent> = (
  args: Partial<ArtificerComponent>
) => ({
  props: args,
});

export const Default = Template.bind({});
Default.args = {};
