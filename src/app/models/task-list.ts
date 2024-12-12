import { ExtendedTask } from './taskModelManager';

export interface TaskList {
  id: string; // Unique identifier for the list
  title: string; // Display name of the list
  type: string; // Optional type, e.g., 'daily', 'latest'
  parent: string; // Optional parent ID, for hierarchical lists
  description: string; // Optional description for the list
  tasks: string[]; // Array of task IDs
  rules: ListRules; // Optional rules for this list
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

export const defaultTaskLists: TaskList[] = [
  {
    id: 'daily',
    title: 'Daily Tasks',
    type: 'daily',
    description: 'Recurring daily tasks',
    tasks: [], // Will be populated by getDailyTasks()
    rules: {
      filter: (task) => {
        if (task.repeat !== 'daily') return false;

        const { startTime, endTime } = calculatePeriodTimes('daily');
        // Check if the task falls outside the current daily period
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
    type: 'weekly',
    description: 'Recurring weekly tasks',
    tasks: [], // Will be populated by getWeeklyTasks()
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
    type: 'monthly',
    description: 'Recurring monthly tasks',
    tasks: [], // Will be populated by getMonthlyTasks()
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
    type: 'yearly',
    description: 'Recurring yearly tasks',
    tasks: [], // Will be populated by getYearlyTasks()
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
    type: 'settings',
    description: 'Tasks set as focus tasks',
    tasks: [], // Will be populated by getFocusTasks()
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
    type: 'settings',
    description: 'Tasks set as "eat the frog" tasks',
    tasks: [], // Will be populated by getFrogTasks()
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
    type: 'settings',
    description: 'Tasks marked as favorites',
    tasks: [], // Will be populated by getFavoriteTasks()
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
    type: 'latest',
    description: 'Most recently created or updated tasks',
    tasks: [], // Will be populated by getLatestTasks() or getLatestUpdatedTasks()
    rules: {
      filter: () => true, // Include all tasks
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
    type: 'latest',
    description: 'Most recently created or updated tasks',
    tasks: [], // Will be populated by getLatestTasks() or getLatestUpdatedTasks()
    rules: {
      filter: () => true, // Include all tasks
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
    type: 'overlord',
    description: 'Tasks associated with a specific overlord',
    tasks: [], // Will be populated by getOverlordTasks(overlordId)
    rules: {
      filter: (task) => task.stage === 'todo', // Filter tasks that have an overlord
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
    type: 'session',
    description: 'Tasks specific to a particular session',
    tasks: [], // No direct method for session tasks in the provided service, it is handled some other component...
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
    console.log(
      `Task ${task.taskId} lastUpdated: ${task.lastUpdated}, startTime: ${startTime}, endTime: ${endTime}, excluded: ${isOutsideCurrentPeriod}`
    );
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
      currentDate.setHours(0, 0, 0, 0);
      startTime = currentDate.getTime();
      endTime = startTime + 24 * 60 * 60 * 1000 - bufferMs; // Add buffer
      break;

    case 'weekly':
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      startTime = startOfWeek.getTime();
      endTime = startTime + 7 * 24 * 60 * 60 * 1000 - bufferMs;
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
      endTime = nextMonth.getTime() - bufferMs;
      break;

    case 'yearly':
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      startTime = startOfYear.getTime();
      const nextYear = new Date(currentDate.getFullYear() + 1, 0, 1);
      endTime = nextYear.getTime() - bufferMs;
      break;

    default:
      currentDate.setHours(0, 0, 0, 0);
      startTime = currentDate.getTime();
      endTime = startTime + 24 * 60 * 60 * 1000 - bufferMs;
      break;
  }

  return { startTime, endTime };
}
