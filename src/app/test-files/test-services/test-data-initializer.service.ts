import { Injectable } from '@angular/core';
import { getRandomTasks, generateTaskTree, generateRandomTask } from '../test-data/test-task';
import { TaskoratorTask, ROOT_TASK_ID, getRootTaskObject, getDefaultTask } from '../../models/taskModelManager';
import { TaskTree, getDefaultTree } from '../../models/taskTree';
import { getDefaultTaskSettings } from '../../models/settings';
import { getDefaultScore } from '../../models/score';
import { OTHER_CONFIG } from '../../app.config';
import { getUserStorageKeys } from '../../services/core/api-offline.service';

export type TestUserProfile = 'empty' | 'basic' | 'complex' | 'massive';

@Injectable({
  providedIn: 'root',
})
export class TestDataInitializerService {
  constructor() {}

  /**
   * Initialize test data based on the selected profile
   */
  async initializeTestData(): Promise<void> {
    if (!OTHER_CONFIG.OFFLINE_TESTING || !OTHER_CONFIG.TEST_DATA_MODE) {
      console.log('🧪 Test data initialization skipped - not in test mode');
      return;
    }

    console.log('🧪 TestDataInitializerService.initializeTestData called');
    console.log('🧪 Config:', {
      offlineTesting: OTHER_CONFIG.OFFLINE_TESTING,
      testDataMode: OTHER_CONFIG.TEST_DATA_MODE,
      testUserProfile: OTHER_CONFIG.TEST_USER_PROFILE,
      offlineUserLoginId: OTHER_CONFIG.OFFLINE_USER_LOGIN_ID,
      offlineUserId: OTHER_CONFIG.OFFLINE_USER_ID,
    });
    const profile = OTHER_CONFIG.TEST_USER_PROFILE as TestUserProfile;
    const userId = this.getTestUserId(profile);
    console.log(`🧪 Initializing test data for profile: ${profile} (user: ${userId})`);

    try {
      // Clear existing data first
      this.clearTestDataForUser(userId);

      // Generate data based on profile
      const testData = this.generateTestDataForProfile(profile);
      
      // Store in localStorage
      const storageKeys = getUserStorageKeys(userId);
      
      localStorage.setItem(storageKeys.TASKS, JSON.stringify(testData.tasks));
      localStorage.setItem(storageKeys.TREE, JSON.stringify(testData.tree));
      localStorage.setItem(storageKeys.SETTINGS, JSON.stringify(testData.settings));
      localStorage.setItem(storageKeys.SCORE, JSON.stringify(testData.score));
      
      console.log(`🧪 Test data initialized for ${profile} profile:`);
      console.log(`   - Tasks: ${testData.tasks.length}`);
      console.log(`   - Profile: ${profile}`);
      console.log(`   - User ID: ${userId}`);
      
    } catch (error) {
      console.error('🧪 Failed to initialize test data:', error);
    }
  }

  /**
   * Check if test data exists for current profile
   */
  testDataExists(): boolean {
    const profile = OTHER_CONFIG.TEST_USER_PROFILE as TestUserProfile;
    const userId = this.getTestUserId(profile);
    const storageKeys = getUserStorageKeys(userId);
    
    const tasks = localStorage.getItem(storageKeys.TASKS);
    const tree = localStorage.getItem(storageKeys.TREE);
    
    return !!(tasks && tree);
  }

  /**
   * Clear test data for current profile
   */
  clearTestData(): void {
    const profile = OTHER_CONFIG.TEST_USER_PROFILE as TestUserProfile;
    const userId = this.getTestUserId(profile);
    this.clearTestDataForUser(userId);
    console.log(`🧪 Test data cleared for profile: ${profile}`);
  }

  /**
   * Clear test data for specific user
   */
  private clearTestDataForUser(userId: string): void {
    const storageKeys = getUserStorageKeys(userId);
    
    localStorage.removeItem(storageKeys.TASKS);
    localStorage.removeItem(storageKeys.TREE);
    localStorage.removeItem(storageKeys.SETTINGS);
    localStorage.removeItem(storageKeys.SCORE);
    localStorage.removeItem(storageKeys.USER);
  }

  /**
   * Get test user ID based on profile
   */
  private getTestUserId(profile: TestUserProfile): string {
    // Use the configured offline login ID (includes profile suffix if applied)
    return OTHER_CONFIG.OFFLINE_USER_LOGIN_ID as string;
  }

  /**
   * Generate test data based on profile
   */
  private generateTestDataForProfile(profile: TestUserProfile) {
    switch (profile) {
      case 'empty':
        return this.generateEmptyProfile();
      case 'basic':
        return this.generateBasicProfile();
      case 'complex':
        return this.generateComplexProfile();
      case 'massive':
        return this.generateMassiveProfile();
      default:
        return this.generateBasicProfile();
    }
  }

  /**
   * Empty profile - just root task (like new user registration)
   */
  private generateEmptyProfile() {
    const rootTask = getRootTaskObject();
    rootTask.taskId = ROOT_TASK_ID;

    // Create 3 basic tasks like registration service does
    const basicTasks = [
      this.createBasicTask('121212', 'Complete first task', ROOT_TASK_ID),
      this.createBasicTask('212121', 'Try creating task', ROOT_TASK_ID),
      this.createBasicTask('313131', 'Try moving task into subtask', ROOT_TASK_ID),
    ];

    const allTasks = [rootTask, ...basicTasks];
    const tree = this.createSimpleTree(rootTask, basicTasks);

    return {
      tasks: allTasks,
      tree,
      settings: this.getBaseSettings(ROOT_TASK_ID),
      score: getDefaultScore(),
    };
  }

  /**
   * Basic profile - root + some organized tasks
   */
  private generateBasicProfile() {
    const rootTask = getRootTaskObject();
    rootTask.taskId = ROOT_TASK_ID;

    const tasks: TaskoratorTask[] = [rootTask];
    
    // Create main categories
    const categories = [
      { id: 'work-001', name: 'Work Projects', priority: 8 },
      { id: 'personal-001', name: 'Personal Tasks', priority: 6 },
      { id: 'learning-001', name: 'Learning & Development', priority: 7 },
    ];

    categories.forEach(cat => {
      const categoryTask = this.createBasicTask(cat.id, cat.name, ROOT_TASK_ID);
      categoryTask.priority = cat.priority;
      categoryTask.type = 'project';
      tasks.push(categoryTask);

      // Add 2-4 tasks under each category
      const numTasks = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < numTasks; i++) {
        const childTask = generateRandomTask(cat.id);
        childTask.taskId = `${cat.id}-child-${i}`;
        childTask.name = `${cat.name} - Task ${i + 1}`;
        tasks.push(childTask);
      }
    });

    const tree = this.createTreeFromTasks(tasks);

    return {
      tasks,
      tree,
      settings: this.getBaseSettings(ROOT_TASK_ID),
      score: getDefaultScore(),
    };
  }

  /**
   * Complex profile - realistic project structure
   */
  private generateComplexProfile() {
    const rootTask = getRootTaskObject();
    rootTask.taskId = ROOT_TASK_ID;

    const tasks: TaskoratorTask[] = [rootTask];
    
    // Create realistic project structure
    const projects = [
      'Website Redesign',
      'Mobile App Development',
      'Database Migration',
      'API Integration',
      'User Authentication System',
    ];

    projects.forEach((projectName, projectIndex) => {
      const projectId = `project-${projectIndex + 1}`;
      const projectTask = this.createBasicTask(projectId, projectName, ROOT_TASK_ID);
      projectTask.type = 'project';
      projectTask.priority = Math.floor(Math.random() * 6) + 5; // High priority
      tasks.push(projectTask);

      // Add phases for each project
      const phases = ['Planning', 'Development', 'Testing', 'Deployment'];
      phases.forEach((phaseName, phaseIndex) => {
        const phaseId = `${projectId}-phase-${phaseIndex + 1}`;
        const phaseTask = this.createBasicTask(phaseId, `${phaseName} Phase`, projectId);
        phaseTask.type = 'task';
        phaseTask.stage = phaseIndex < 2 ? 'completed' : 'todo';
        tasks.push(phaseTask);

        // Add 3-5 subtasks per phase
        const numSubtasks = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < numSubtasks; i++) {
          const subtask = generateRandomTask(phaseId);
          subtask.taskId = `${phaseId}-subtask-${i + 1}`;
          subtask.name = `${phaseName} - Step ${i + 1}`;
          subtask.stage = Math.random() > 0.6 ? 'completed' : 'todo';
          tasks.push(subtask);
        }
      });
    });

    // Add some daily tasks
    const dailyParent = 'daily-001';
    const dailyTask = this.createBasicTask(dailyParent, 'Daily Tasks', ROOT_TASK_ID);
    dailyTask.type = 'project';
    tasks.push(dailyTask);

    for (let i = 0; i < 10; i++) {
      const daily = generateRandomTask(dailyParent);
      daily.taskId = `daily-task-${i + 1}`;
      daily.name = `Daily Task ${i + 1}`;
      daily.type = 'todo';
      daily.stage = Math.random() > 0.4 ? 'todo' : 'completed';
      tasks.push(daily);
    }

    const tree = this.createTreeFromTasks(tasks);

    return {
      tasks,
      tree,
      settings: this.getBaseSettings(ROOT_TASK_ID),
      score: getDefaultScore(),
    };
  }

  /**
   * Massive profile - lots of data for performance testing
   */
  private generateMassiveProfile() {
    const rootTask = getRootTaskObject();
    rootTask.taskId = ROOT_TASK_ID;

    const tasks: TaskoratorTask[] = [rootTask];
    
    // Generate large task tree
    const generatedTasks = generateTaskTree(ROOT_TASK_ID, 4, 8); // 4 levels deep, 8 children each
    tasks.push(...generatedTasks);

    // Add some standalone random tasks
    const randomTasks = getRandomTasks();
    randomTasks.forEach((task, index) => {
      task.taskId = `random-${index + 1000}`;
      task.overlord = ROOT_TASK_ID;
    });
    tasks.push(...randomTasks);

    const tree = this.createTreeFromTasks(tasks);

    return {
      tasks,
      tree,
      settings: this.getBaseSettings(ROOT_TASK_ID),
      score: getDefaultScore(),
    };
  }

  /**
   * Create a basic task
   */
  private createBasicTask(taskId: string, name: string, overlord: string): TaskoratorTask {
    const task = getDefaultTask();
    task.taskId = taskId;
    task.name = name;
    task.overlord = overlord;
    task.timeCreated = Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in last week
    task.lastUpdated = Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000); // Random time in last day
    return task;
  }

  /**
   * Create a simple tree structure
   */
  private createSimpleTree(rootTask: TaskoratorTask, childTasks: TaskoratorTask[]): TaskTree {
    const tree = getDefaultTree();
    tree.primarch.taskId = rootTask.taskId;
    tree.primarch.name = rootTask.name;
    tree.primarch.childrenCount = childTasks.length;
    tree.totalTasks = childTasks.length + 1; // +1 for root
    return tree;
  }

  /**
   * Create tree from tasks (simplified version)
   */
  private createTreeFromTasks(tasks: TaskoratorTask[]): TaskTree {
    const tree = getDefaultTree();
    const rootTask = tasks.find(t => t.taskId === ROOT_TASK_ID);
    if (rootTask) {
      tree.primarch.taskId = rootTask.taskId;
      tree.primarch.name = rootTask.name;
    }
    tree.totalTasks = tasks.length;
    return tree;
  }

  /**
   * Get base settings
   */
  private getBaseSettings(initialTaskId: string) {
    const baseSettings = getDefaultTaskSettings();
    baseSettings.lastOverlordViewId = initialTaskId;
    return baseSettings;
  }
}
