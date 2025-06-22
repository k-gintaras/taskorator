import { Injectable } from '@angular/core';
import { ExtendedTask } from '../../models/taskModelManager';
import { TaskListKey, TaskListRules } from '../../models/task-list-model';
import { TaskListRulesService } from './task-list-rules.service';

/**
 * Service responsible for applying display rules to task lists.
 *
 * This service takes raw task data and applies sorting, filtering,
 * and display rules specific to each list type. For example:
 * - Root tasks sorted by priority
 * - Created tasks sorted by date
 * - Focus tasks with certain filters applied
 *
 * Usage in components:
 * 1. Get raw tasks from TaskListDataService
 * 2. Apply display rules using this service
 * 3. Display the processed tasks
 */
@Injectable({
  providedIn: 'root',
})
export class TaskViewService {
  constructor(private taskListRulesService: TaskListRulesService) {}

  /**
   * Apply display rules to a list of tasks
   *
   * @param taskListKey - The type of list to get rules for
   * @param tasks - Raw tasks to process
   * @returns Processed tasks with rules applied (sorted, filtered, etc.)
   */
  applyDisplayRules(
    taskListKey: TaskListKey,
    tasks: ExtendedTask[]
  ): ExtendedTask[] {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // Apply the rules defined for this list type
    return this.taskListRulesService.applyRulesToList(taskListKey, tasks);
  }

  /**
   * Get the display rules for a specific list type
   *
   * @param taskListKey - The list type to get rules for
   * @returns The rules object containing sort/filter/display preferences
   */
  getDisplayRules(taskListKey: TaskListKey): TaskListRules | null {
    return this.taskListRulesService.getList(taskListKey);
  }

  /**
   * Check if a task list should auto-refresh based on its rules
   *
   * @param taskListKey - The list type to check
   * @returns Whether this list type should auto-refresh on task actions
   */
  shouldAutoRefresh(taskListKey: TaskListKey): boolean {
    const rules = this.getDisplayRules(taskListKey);
    return rules?.autoRefresh ?? false;
  }
}
