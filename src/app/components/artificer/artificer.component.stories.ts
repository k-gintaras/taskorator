import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { ArtificerComponent } from './artificer.component';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';
import { ArtificerService } from './artificer.service';
import { artificerDetailList, ArtificerDetails } from './artificer.interface';
import { Task } from '../../models/taskModelManager';

class MockArtificerService {
  private actions: ArtificerDetails[] = artificerDetailList;
  private currentActionSubject = new BehaviorSubject<ArtificerDetails>(
    this.actions[0]
  );
  currentAction$ = this.currentActionSubject.asObservable();
  selectedTasks: Task[] = []; // Simulate selected tasks

  // Returns available actions
  getActions(): ArtificerDetails[] {
    return this.actions;
  }

  // Set the current action
  setCurrentAction(action: ArtificerDetails): void {
    this.currentActionSubject.next(action);
  }

  // Simulated action methods
  delete(task: Task): void {
    console.log(`Deleted task: ${task.name}`);
  }

  complete(task: Task): void {
    console.log(`Completed task: ${task.name}`);
  }

  refresh(task: Task): void {
    console.log(`Refreshed task: ${task.name}`);
  }

  moveSelectedInto(task: Task): void {
    console.log(`Moved selected tasks into task: ${task.name}`);
  }

  split(task: Task): void {
    console.log(`Split task: ${task.name}`);
  }

  crush(task: Task): void {
    console.log(`Crushed selected tasks into task: ${task.name}`);
  }

  merge(task: Task): void {
    console.log(`Merged selected tasks into task: ${task.name}`);
  }

  extract(task: Task): void {
    console.log(`Extracted tasks from: ${task.name}`);
  }

  clearSelected(): void {
    this.selectedTasks = [];
    console.log(`Cleared selected tasks`);
  }

  selectAll(): void {
    console.log(`Selected all tasks in the current view`);
  }

  edit(task: Task): void {
    console.log(`Editing task: ${task.name}`);
  }

  promote(task: Task): void {
    console.log(`Promoted task: ${task.name}`);
  }

  demote(task: Task): void {
    console.log(`Demoted task: ${task.name}`);
  }

  select(task: Task): void {
    console.log(`Selected task: ${task.name}`);
  }

  suggest(task: Task): void {
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
