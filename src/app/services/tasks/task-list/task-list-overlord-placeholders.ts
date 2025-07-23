import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { UiTask, getRootUiTask } from '../../../models/taskModelManager';

export function getOverlordPlaceholder(listKey: TaskListKey): UiTask {
  const baseTask: UiTask = getRootUiTask();

  switch (listKey.type) {
    case TaskListType.OVERLORD:
    case TaskListType.SUPER_OVERLORD:
    case TaskListType.DAILY:
      baseTask.name = "Today's Mission";
      baseTask.todo = 'Conquer your daily habits and routines';
      baseTask.why = 'Small daily wins lead to extraordinary results';
      return baseTask;

    case TaskListType.WEEKLY:
      baseTask.name = 'Weekly Focus';
      baseTask.todo = 'Build momentum with consistent weekly goals';
      baseTask.why = 'Progress happens one week at a time';
      return baseTask;

    case TaskListType.MONTHLY:
      baseTask.name = 'Monthly Sprint';
      baseTask.todo = 'Transform ideas into achievements this month';
      baseTask.why = 'Monthly planning turns dreams into deadlines';
      return baseTask;

    case TaskListType.YEARLY:
      baseTask.name = 'Annual Vision';
      baseTask.todo = 'Shape your year with purposeful actions';
      baseTask.why = 'This year is your chance to level up';
      return baseTask;

    case TaskListType.FOCUS:
      baseTask.name = 'Deep Work Zone';
      baseTask.todo = 'Channel your energy into what matters most';
      baseTask.why = 'Focus is your superpower';
      return baseTask;

    case TaskListType.FROG:
      baseTask.name = 'Eat The Frog';
      baseTask.todo = 'Tackle your biggest challenge first';
      baseTask.why = 'Hard things become easy when you start';
      return baseTask;

    case TaskListType.FAVORITE:
      baseTask.name = 'Your Greatest Hits';
      baseTask.todo = 'Revisit the tasks that spark joy and growth';
      baseTask.why = 'These are the tasks that define you';
      return baseTask;

    case TaskListType.LATEST_CREATED:
      baseTask.name = 'Fresh Ideas';
      baseTask.todo = 'Your newest inspirations waiting to take flight';
      baseTask.why = 'Every great achievement started as a new idea';
      return baseTask;

    case TaskListType.LATEST_UPDATED:
      baseTask.name = 'Active Projects';
      baseTask.todo = 'Keep the momentum going on these evolving tasks';
      baseTask.why = 'Progress is the best motivation';
      return baseTask;

    case TaskListType.SESSION:
      baseTask.name = 'Focus Session';
      baseTask.todo = 'Dedicated time for concentrated work';
      baseTask.why = 'Sessions turn scattered effort into focused results';
      return baseTask;

    case TaskListType.SELECTED:
      baseTask.name = 'Selected Tasks';
      baseTask.todo = 'Tasks you’ve selected for immediate attention';
      baseTask.why = 'Selection reveals priority by intent';
      return baseTask;

    case TaskListType.TASKORATOR:
      baseTask.name = 'Taskorator Mix';
      baseTask.todo = 'An algorithmic blend of projects and priorities';
      baseTask.why = 'Curated variety fuels consistent progress';
      return baseTask;
    case TaskListType.MOST_VIEWED:
      baseTask.name = 'Most Viewed Tasks';
      baseTask.todo = 'Tasks that have been viewed the most';
      baseTask.why = 'Visibility drives engagement and action';
      return baseTask;

    default:
      return baseTask;
  }
}
