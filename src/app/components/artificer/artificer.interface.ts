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
  { action: 'complete', icon: 'check', colorClass: 'success-icon-color', tooltip: 'Mark task as complete' },
  { action: 'delete', icon: 'delete', colorClass: 'danger-icon-color', tooltip: 'Delete selected tasks' },
  { action: 'refresh', icon: 'refresh', colorClass: 'info-icon-color', tooltip: 'Reset task to TODO status' },
  { action: 'move', icon: 'move_to_inbox', colorClass: 'move-icon-color', tooltip: 'Move selected tasks into this task' },
  { action: 'edit', icon: 'edit', colorClass: 'edit-icon-color', tooltip: 'Edit task details' },
  { action: 'select', icon: 'check_box', colorClass: 'select-icon-color', tooltip: 'Toggle task selection' },
  { action: 'suggest', icon: 'search', colorClass: 'suggest-icon-color', tooltip: 'Get AI suggestions for task' },
  { action: 'promote', icon: 'expand_less', colorClass: 'promote-icon-color', tooltip: 'Promote task priority' },
  { action: 'demote', icon: 'expand_more', colorClass: 'demote-icon-color', tooltip: 'Demote task priority' },
  { action: 'mass', icon: 'add', colorClass: 'mass-icon-color', tooltip: 'Mass add similar tasks' },
  {
    action: 'moveToParent',
    icon: 'arrow_upward',
    colorClass: 'parent-icon-color',
    tooltip: 'Move task to parent level',
  },
];
