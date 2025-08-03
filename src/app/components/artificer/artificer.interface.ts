import { TaskoratorTask } from '../../models/taskModelManager';

// likely will perform actions on selected tasks on click
// another idea was to replace all task buttons with current "action" (probably bad idea)
// improvement suggestions welcome to make it less than 2 clicks...
// i.e. we select task action mode... then we can blast all tasks with it... somehow
export interface Artificer {
  delete(task: TaskoratorTask): void;
  complete(task: TaskoratorTask): void;
  refresh(task: TaskoratorTask): void; // just make task back into TODO
  moveSelectedInto(task: TaskoratorTask): void; // move selected tasks into this task
  split(task: TaskoratorTask): void; // will delete it and create 2 new (or... create 2 inside it?)
  crush(task: TaskoratorTask): void; // will move them into 1 new
  merge(task: TaskoratorTask): void; // will delete all selected and create 1 new
  extract(task: TaskoratorTask): void; // extract inside tasks and make them selected?
  clearSelected(): void; // clears all selected tasks
  selectAll(): void; // selects current navigation view tasks
  edit(task: TaskoratorTask): void; // opens edit menu?
  promote(task: TaskoratorTask): void;
  demote(task: TaskoratorTask): void;
  select(task: TaskoratorTask): void;
  suggest(task: TaskoratorTask): void;
  mass(task: TaskoratorTask): void;
  moveToParent(task: TaskoratorTask): void;
}

export interface ArtificerDetails {
  action: string;
  icon: string;
  colorClass: string;
  tooltip: string;
}

export const artificerDetailList: ArtificerDetails[] = [
  { action: 'complete', icon: 'check', colorClass: 'complete-icon-color', tooltip: 'Mark task as complete' },
  { action: 'delete', icon: 'delete', colorClass: 'delete-icon-color', tooltip: 'Delete selected tasks' },
  { action: 'refresh', icon: 'refresh', colorClass: 'refresh-icon-color', tooltip: 'Reset task to TODO status' },
  { action: 'move', icon: 'move_to_inbox', colorClass: 'refresh-icon-color', tooltip: 'Move selected tasks into this task' },
  { action: 'edit', icon: 'edit', colorClass: 'refresh-icon-color', tooltip: 'Edit task details' },
  { action: 'select', icon: 'check_box', colorClass: 'refresh-icon-color', tooltip: 'Toggle task selection' },
  { action: 'suggest', icon: 'search', colorClass: 'refresh-icon-color', tooltip: 'Get AI suggestions for task' },
  { action: 'promote', icon: 'expand_less', colorClass: 'refresh-icon-color', tooltip: 'Promote task priority' },
  { action: 'demote', icon: 'expand_more', colorClass: 'refresh-icon-color', tooltip: 'Demote task priority' },
  { action: 'mass', icon: 'add', colorClass: 'refresh-icon-color', tooltip: 'Mass add similar tasks' },
  {
    action: 'moveToParent',
    icon: 'arrow_upward',
    colorClass: 'refresh-icon-color',
    tooltip: 'Move task to parent level',
  },
];
