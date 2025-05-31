import { ExtendedTask, ROOT_TASK_ID } from './taskModelManager';

export interface TaskListRules {
  id: string; // Unique identifier for the list
  title: string; // Display name of the list
  type: TaskListType; // Optional type, e.g., 'daily', 'latest'
  parent: string; // Optional parent ID, for hierarchical lists
  description: string; // Optional description for the list
  // tasks: string[]; // Array of task IDs // we don't really want to make this list into an angular app wich its own cache and stuffs
  rules: ListRules; // Optional rules for this list
}

export enum TaskListType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LATEST_UPDATED = 'latestUpdated',
  LATEST_CREATED = 'latestCreated',
  FOCUS = 'focus',
  FROG = 'frog',
  FAVORITE = 'favorite',
  OVERLORD = 'overlord',
  SESSION = 'session',
}

export enum TaskListSubtype {
  SETTINGS = 'settings',
  SESSION = 'session',
  REPEATING = 'repeating',
  API = 'api',
}

// export enum TaskListKey {
//   OVERLORD = 'overlord_',
//   FOCUS = 'settings_focus',
//   FROG = 'settings_frog',
//   FAVORITE = 'settings_favorite',
//   DAILY = 'repeating_daily',
//   WEEKLY = 'repeating_weekly',
//   MONTHLY = 'repeating_monthly',
//   YEALRY = 'repeating_yearly',
//   CREATED = 'latest_created',
//   UPDATED = 'latest_updated',
//   SESSION = 'session_',
// }

export interface TaskListKey {
  type: TaskListType;
  data: TaskListSubtype | string; // task id, session name ...
}

export interface ListRules {
  filter: (task: ExtendedTask) => boolean; // A filter function for tasks
  sorter: (a: ExtendedTask, b: ExtendedTask) => number; // A sort function
  permissions: ListPermissions; // Permissions for actions
}

export interface ListPermissions {
  canAdd: boolean;
  canMove: boolean;
  canDelete: boolean;
  canComplete: boolean;
}

export function getIdFromKey(key: TaskListKey): string {
  // if (key.type === TaskListType.OVERLORD || key.type === TaskListType.SESSION) {
  //   return `${key.type}_${key.data}`;
  // }
  return `${key.type}_${key.data}`; // For static lists
}

export const defaultTaskLists: TaskListRules[] = [
  {
    id: 'daily',
    title: 'Daily Tasks',
    type: TaskListType.DAILY,
    description: 'Recurring daily tasks',
    rules: {
      filter: (task) => {
        if (task.repeat !== 'daily') {
          return false;
        }
        const { startTime, endTime } = calculatePeriodTimes('daily');
        return task.lastUpdated < startTime || task.lastUpdated >= endTime;
      },
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      permissions: {
        canAdd: false, // TODO: enable once create task component can know what list is displayed, and if task is added and is task.repeat (then we add to the repeat list (cache), its added in api anyway)
        canMove: false, // this is loose list we can't just add tasks there (unless we allow it in future?)
        canDelete: true,
        canComplete: true,
      },
    },
    parent: '',
  },
  {
    id: 'weekly',
    title: 'Weekly Tasks',
    type: TaskListType.WEEKLY,
    description: 'Recurring weekly tasks',
    rules: {
      filter: (task) => {
        if (task.repeat !== 'weekly') return false;

        const { startTime, endTime } = calculatePeriodTimes('weekly');
        // Check if the task falls outside the current daily period

        return task.lastUpdated < startTime || task.lastUpdated >= endTime;
      },
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      permissions: {
        canAdd: false, // TODO: enable once create task component can know what list is displayed, and if task is added and is task.repeat (then we add to the repeat list (cache), its added in api anyway)
        canMove: false,
        canDelete: true,
        canComplete: true,
      },
    },
    parent: '',
  },
  {
    id: 'monthly',
    title: 'Monthly Tasks',
    type: TaskListType.MONTHLY,
    description: 'Recurring monthly tasks',
    rules: {
      filter: (task) => {
        if (task.repeat !== 'monthly') return false;

        const { startTime, endTime } = calculatePeriodTimes('monthly');
        // Check if the task falls outside the current daily period
        return task.lastUpdated < startTime || task.lastUpdated >= endTime;
      },
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      permissions: {
        canAdd: false, // TODO: enable once create task component can know what list is displayed, and if task is added and is task.repeat (then we add to the repeat list (cache), its added in api anyway)
        canMove: false,
        canDelete: true,
        canComplete: true,
      },
    },
    parent: '',
  },
  {
    id: 'yearly',
    title: 'Yearly Tasks',
    type: TaskListType.YEARLY,
    description: 'Recurring yearly tasks',
    rules: {
      filter: (task) => {
        if (task.repeat !== 'yearly') return false;

        const { startTime, endTime } = calculatePeriodTimes('yearly');
        // Check if the task falls outside the current daily period
        return task.lastUpdated < startTime || task.lastUpdated >= endTime;
      },
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      permissions: {
        canAdd: false, // TODO: enable once create task component can know what list is displayed, and if task is added and is task.repeat (then we add to the repeat list (cache), its added in api anyway)
        canMove: false,
        canDelete: true,
        canComplete: true,
      },
    },
    parent: '',
  },
  {
    id: 'focus',
    title: 'Focus Tasks',
    type: TaskListType.FOCUS,
    description: 'Tasks set as focus tasks',
    rules: {
      filter: (task) => task.stage === 'todo',
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      permissions: {
        canAdd: false, // TODO:  is added through separate component, but we maybe can enable later in task create
        canMove: false, // we can never move because if we do, we don't even know where from... because those are lose
        canDelete: false, // ambiguous... delete from this list or delete completely?
        canComplete: true,
      },
    },
    parent: '',
  },
  {
    id: 'frog',
    title: 'Frog Tasks',
    type: TaskListType.FROG,
    description: 'Tasks set as "eat the frog" tasks',
    rules: {
      filter: (task) => task.stage === 'todo',
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      permissions: {
        canAdd: false, // TODO:  is added through separate component, but we maybe can enable later in task create
        canMove: false, // we can never move because if we do, we don't even know where from... because those are lose
        canDelete: false, // ambiguous... delete from this list or delete completely?
        canComplete: true,
      },
    },
    parent: '',
  },
  {
    id: 'favorites',
    title: 'Favorite Tasks',
    type: TaskListType.FAVORITE,
    description: 'Tasks marked as favorites',
    rules: {
      filter: (task) => task.stage === 'todo',
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      permissions: {
        canAdd: true, // TODO:  is added through separate component, but we maybe can enable later in task create
        canMove: false, // we can never move because if we do, we don't even know where from... because those are lose
        canDelete: false, // ambiguous... delete from this list or delete completely?
        canComplete: true,
      },
    },
    parent: '',
  },
  {
    id: 'latestCreated',
    title: 'Latest Created Tasks',
    type: TaskListType.LATEST_CREATED,
    description: 'Most recently created or updated tasks',
    rules: {
      filter: (task) => task.taskId !== ROOT_TASK_ID, // don't show root when it is updated, as it might seem as normal task...
      sorter: (a, b) => (b.timeCreated || 0) - (a.timeCreated || 0), // Most recent first
      permissions: {
        canAdd: false, // we don't know which overlord to add it to
        canMove: false, // we don't know from where... we are seeing this as lose tasks
        canDelete: true,
        canComplete: true,
      },
    },
    parent: '',
  },
  {
    id: 'latestUpdated',
    title: 'Latest Updated Tasks',
    type: TaskListType.LATEST_UPDATED,
    description: 'Most recently created or updated tasks',
    rules: {
      filter: (task) => task.taskId !== ROOT_TASK_ID, // don't show root when it is updated, as it might seem as normal task...
      sorter: (a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0), // Most recent first
      permissions: {
        canAdd: true, // we don't know which overlord to add it to
        canMove: true, // we don't know from where... we are seeing this as lose tasks
        canDelete: true,
        canComplete: true,
      },
    },
    parent: '',
  },
  {
    id: 'overlord_*', // The * indicates this is a dynamic ID pattern
    title: 'Overlord Tasks',
    type: TaskListType.OVERLORD,
    description: 'Tasks associated with a specific overlord',
    rules: {
      filter: (task) => task.stage === 'todo' && task.taskId !== ROOT_TASK_ID, // Filter tasks that have an overlord
      sorter: (a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0), // Most recent first
      permissions: {
        canAdd: true,
        canMove: true,
        canDelete: true,
        canComplete: true,
      },
    },
    parent: '', // Can be set to the specific overlord ID when used
  },
  {
    id: 'session_*', // The * indicates this is a dynamic ID pattern
    title: 'Session Tasks',
    type: TaskListType.SESSION,
    description: 'Tasks specific to a particular session',
    rules: {
      filter: (task) => task.stage === 'todo', // Filter tasks that have a session ID
      sorter: (a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0), // Most recent first
      permissions: {
        canAdd: false, // complex session situation, we can't really easily add, unless in future "create task component can handle it"
        canMove: false, // don't know from where...
        canDelete: false, // ambiguous... delete from this list or delete completely?
        canComplete: true,
      },
    },
    parent: '', // Can be set to the specific session ID when used
  },
];

function filterTasks(
  tasks: ExtendedTask[],
  filterCompleted: boolean,
  repeatInterval: string
): ExtendedTask[] {
  if (!filterCompleted) return tasks;

  const { startTime, endTime } = calculatePeriodTimes(repeatInterval);

  return tasks.filter((task) => {
    const isOutsideCurrentPeriod =
      task.lastUpdated < startTime || task.lastUpdated >= endTime;
    return isOutsideCurrentPeriod;
  });
}

function calculatePeriodTimes(repeatInterval: string): {
  startTime: number;
  endTime: number;
} {
  const BUFFER_HOURS = 12; // Adjustable buffer for tasks reappearing sooner.
  const bufferMs = BUFFER_HOURS * 60 * 60 * 1000;
  const currentDate = new Date();

  let startTime: number;
  let endTime: number;

  switch (repeatInterval) {
    case 'daily':
      currentDate.setHours(0, 0, 0, 0); // Start of the day
      startTime = currentDate.getTime();
      endTime = startTime + 24 * 60 * 60 * 1000; // Start of the next day
      break;

    case 'weekly':
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0); // Start of the week
      startTime = startOfWeek.getTime();
      endTime = startTime + 7 * 24 * 60 * 60 * 1000; // Start of the next week
      break;

    case 'monthly':
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      startTime = startOfMonth.getTime();
      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
      endTime = nextMonth.getTime(); // Start of the next month
      break;

    case 'yearly':
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      startTime = startOfYear.getTime();
      const nextYear = new Date(currentDate.getFullYear() + 1, 0, 1);
      endTime = nextYear.getTime(); // Start of the next year
      break;

    default:
      currentDate.setHours(0, 0, 0, 0); // Start of the day
      startTime = currentDate.getTime();
      endTime = startTime + 24 * 60 * 60 * 1000; // Start of the next day
      break;
  }

  // Apply buffer only to the next period
  endTime += bufferMs;

  return { startTime, endTime };
}
