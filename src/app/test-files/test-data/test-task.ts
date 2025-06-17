import {
  ROOT_TASK_ID,
  getDefaultTask,
  RepeatOptions,
  TaskStatus,
  TaskStage,
  TaskType,
  TaskSubtype,
  TaskSize,
  TaskoratorTask,
} from '../../models/taskModelManager';

// Utility to generate random data
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomTask() {
  return generateRandomTask();
}

export function getDefaultTaskCustomized(
  overrides: Partial<TaskoratorTask> = {}
): TaskoratorTask {
  // Use the existing getDefaultTask as the base and apply overrides
  const baseTask = getDefaultTask();
  return {
    ...baseTask,
    ...overrides,
  };
}

// Generate a random task
export function generateRandomTask(
  overlord: string | null = ROOT_TASK_ID
): TaskoratorTask {
  const now = Date.now();
  const maxOffsetMs = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
  const randomOffset = Math.floor(Math.random() * maxOffsetMs);
  return {
    ...getDefaultTask(),
    taskId: Math.floor(Math.random() * 1000000).toString(),
    name: `Task ${Math.floor(Math.random() * 1000)} ` + generateRandomName(),
    todo: `Do something important ${Math.floor(Math.random() * 10)}`,
    why: `Because ${Math.floor(Math.random() * 10)}`,
    timeCreated: now - randomOffset,
    lastUpdated: now,
    timeEnd: Math.random() > 0.5 ? now + 3600000 : null, // 1 hour from now or null
    duration: Math.floor(Math.random() * 240), // Up to 4 hours
    overlord,
    repeat: getRandomElement([
      'once',
      'daily',
      'weekly',
      'monthly',
    ] as RepeatOptions[]),
    status: getRandomElement(['active', 'inactive'] as TaskStatus[]),
    stage: getRandomElement([
      'todo',
      'seen',
      'completed',
      'archived',
    ] as TaskStage[]),
    type: getRandomElement(['todo', 'task', 'project', 'note'] as TaskType[]),
    subtype: getRandomElement(['js', 'ts', 'html', 'css'] as TaskSubtype[]),
    size: getRandomElement(['do now', 'split', 'delegate'] as TaskSize[]),
    priority: Math.floor(Math.random() * 10) + 1, // Priority 1-10
    backupLink: Math.random() > 0.7 ? 'http://example.com' : '',
    imageUrl: null,
    imageDataUrl: null,
    tags: ['tag1', 'tag2', `tag${Math.floor(Math.random() * 10)}`],
  };
}

export function generateRandomName() {
  const symbols = 'abcdefghijklmnopqrstuvwxyz1234567890 ';
  let s = '';
  const size = Math.floor(Math.random() * 100);
  for (let i = 0; i < size; i++) {
    const randomChar = Math.floor(Math.random() * symbols.length);
    const val = symbols[randomChar];
    s += val;
  }
  return s;
}

export function getRandomTasks(): TaskoratorTask[] {
  const tasks = [];
  for (let i = 0; i < 10; i++) {
    const t = generateRandomTask();
    tasks.push(t);
  }
  return tasks;
}

// Generate a task tree
export function generateTaskTree(
  rootId: string,
  depth: number,
  breadth: number
): TaskoratorTask[] {
  const tasks: TaskoratorTask[] = [];
  const queue: { parentId: string; currentDepth: number }[] = [
    { parentId: rootId, currentDepth: 0 },
  ];

  while (queue.length > 0) {
    const { parentId, currentDepth } = queue.shift()!;
    if (currentDepth >= depth) continue;

    for (let i = 0; i < breadth; i++) {
      const task = generateRandomTask(parentId);
      tasks.push(task);
      queue.push({ parentId: task.taskId, currentDepth: currentDepth + 1 });
    }
  }
  return tasks;
}
