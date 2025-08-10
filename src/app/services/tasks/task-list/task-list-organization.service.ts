import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UiTask } from '../../../models/taskModelManager';
import { TaskListKey } from '../../../models/task-list-model';
import { TaskListRulesService } from './task-list-rules.service';

export type SortMode = 'rules' | 'date' | 'priority' | 'custom';

export interface TaskListOrganizationState {
  sortMode: SortMode;
  // 'asc' | 'desc' for date and priority sorts
  sortDirection: 'asc' | 'desc';
  isVisible: boolean;
  currentListKey: TaskListKey | null;
}

@Injectable({
  providedIn: 'root',
})
export class TaskListOrganizationService {
  private organizationStateSubject = new BehaviorSubject<TaskListOrganizationState>({
    sortMode: 'rules',
    sortDirection: 'asc',
    isVisible: true,
    currentListKey: null,
  });

  public organizationState$ = this.organizationStateSubject.asObservable();

  constructor(private taskListRules: TaskListRulesService) {}

  /**
   * Get the current organization state
   */
  getCurrentState(): TaskListOrganizationState {
    return this.organizationStateSubject.value;
  }

  /**
   * Update the sort mode
   */
  setSortMode(sortMode: SortMode): void {
    const current = this.organizationStateSubject.value;
    let direction = current.sortDirection;
    if (sortMode === current.sortMode) {
      // Toggle direction only for date or priority
      if (sortMode === 'date' || sortMode === 'priority') {
        direction = direction === 'asc' ? 'desc' : 'asc';
      }
    } else {
      // Set default direction: asc for date, desc for priority, asc otherwise
      if (sortMode === 'date') direction = 'asc';
      else if (sortMode === 'priority') direction = 'desc';
      else direction = 'asc';
    }
    this.organizationStateSubject.next({
      ...current,
      sortMode,
      sortDirection: direction,
    });
  }

  /**
   * Set the current list key being organized
   */
  setCurrentListKey(listKey: TaskListKey | null): void {
    const currentState = this.organizationStateSubject.value;
    this.organizationStateSubject.next({
      ...currentState,
      currentListKey: listKey,
    });
  }

  /**
   * Toggle visibility of tasks
   */
  toggleVisibility(): void {
    const currentState = this.organizationStateSubject.value;
    this.organizationStateSubject.next({
      ...currentState,
      isVisible: !currentState.isVisible,
    });
  }

  /**
   * Organize tasks based on current organization state
   */
  organizeTasks(tasks: UiTask[], listKey?: TaskListKey): UiTask[] {
    const state = this.getCurrentState();
    const keyToUse = listKey || state.currentListKey;

    if (!state.isVisible) {
      return [];
    }

    let organizedTasks = [...tasks];

    switch (state.sortMode) {
      case 'rules':
        // Apply the list's default rules-based sorting
        if (keyToUse) {
          organizedTasks = this.taskListRules.applyRulesToList(keyToUse, organizedTasks);
        }
        break;
      
      case 'date':
        organizedTasks.sort((a, b) => {
          const diff = (a.timeCreated || 0) - (b.timeCreated || 0);
          return state.sortDirection === 'asc' ? diff : -diff;
        });
        break;
      
      case 'priority':
        organizedTasks.sort((a, b) => {
          const diff = (a.priority || 0) - (b.priority || 0);
          return state.sortDirection === 'asc' ? diff : -diff;
        });
        break;
      
      case 'custom':
        // For future custom sorting implementations
        break;
      
      default:
        // Fallback to rules
        if (keyToUse) {
          organizedTasks = this.taskListRules.applyRulesToList(keyToUse, organizedTasks);
        }
        break;
    }

    return organizedTasks;
  }

  /**
   * Reset to default organization (rules-based)
   */
  resetToDefault(): void {
    this.setSortMode('rules');
  }

  /**
   * Check if the current sort mode is the default (rules)
   */
  isDefaultSort(): boolean {
    return this.getCurrentState().sortMode === 'rules';
  }

  /**
   * Get available sort modes for the current list
   */
  getAvailableSortModes(listKey?: TaskListKey): SortMode[] {
    // All lists support these basic modes
    const baseModes: SortMode[] = ['rules', 'date', 'priority'];
    
    // In the future, we can add logic to determine if custom sorting is available
    // based on the list type or other criteria
    
    return baseModes;
  }
}
