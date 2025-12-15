import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TaskActionTrackerService, TaskActions } from '../../services/tasks/task-action-tracker.service';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { TaskUpdateService } from '../../services/tasks/task-update.service';
import { UiTask } from '../../models/taskModelManager';
import { Router } from '@angular/router';

interface TaskAction {
  taskIds: string[];
  action: string;
  subAction?: string;
  message: string;
  timestamp: number;
  source: string;
}

@Component({
  selector: 'app-last-action-viewer',
  standalone: true,
  imports: [CommonModule, MatIcon, MatButtonModule],
  templateUrl: './last-action-viewer.component.html',
  styleUrls: ['./last-action-viewer.component.scss'],
})
export class LastActionViewerComponent implements OnInit {
  lastAction: TaskAction | null = null;
  affectedTasks: UiTask[] = [];
  isLoading = false;

  constructor(
    private taskActionTracker: TaskActionTrackerService,
    private taskService: TaskService,
    private taskUpdateService: TaskUpdateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to last action changes
    this.taskActionTracker.lastAction$.subscribe(async (action) => {
      this.lastAction = action;
      if (action && action.taskIds.length > 0) {
        await this.loadAffectedTasks(action.taskIds);
      } else {
        this.affectedTasks = [];
      }
    });
  }

  private async loadAffectedTasks(taskIds: string[]): Promise<void> {
    this.isLoading = true;
    try {
      const tasks = await Promise.all(
        taskIds.map((id) => this.taskService.getTaskById(id))
      );
      this.affectedTasks = tasks.filter((task: UiTask | null) => task !== null) as UiTask[];
    } catch (error) {
      console.error('Error loading affected tasks:', error);
      this.affectedTasks = [];
    } finally {
      this.isLoading = false;
    }
  }

  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      created: 'add_circle',
      updated: 'edit',
      completed: 'check_circle',
      archived: 'archive',
      deleted: 'delete',
      moved: 'drive_file_move',
      renamed: 'edit',
      priorityIncreased: 'arrow_upward',
      priorityDecreased: 'arrow_downward',
    };
    return iconMap[action] || 'info';
  }

  getActionColor(action: string): string {
    const colorMap: { [key: string]: string } = {
      created: '--success',
      updated: '--purple-primary',
      completed: '--success',
      archived: '--warning',
      deleted: '--error',
      moved: '--purple-primary',
    };
    return colorMap[action] || '--text-primary';
  }

  formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleString();
  }

  navigateToTask(taskId: string): void {
    this.router.navigate(['/crucible/latestUpdated']);
  }

  async undoAction(): Promise<void> {
    if (!this.lastAction || !this.canUndo()) return;
    
    // For now, only handle undo for completed tasks
    if (this.lastAction.action === 'completed') {
      try {
        // Update all affected tasks to set stage back to 'todo'
        for (const task of this.affectedTasks) {
          const updatedTask = { ...task, stage: 'todo' as const };
          await this.taskUpdateService.update(updatedTask, TaskActions.RENEWED, 'Undone from completed');
        }
        
        // Show success message or navigate
        console.log('Successfully undone:', this.lastAction);
      } catch (error) {
        console.error('Error undoing action:', error);
        alert('Failed to undo action');
      }
    } else {
      // For other actions, show placeholder
      console.log('Undo action:', this.lastAction);
      alert('Undo functionality for this action coming soon!');
    }
  }

  canUndo(): boolean {
    if (!this.lastAction) return false;
    // Only allow undo for certain actions
    const undoableActions = ['created', 'updated', 'deleted', 'completed', 'moved'];
    return undoableActions.includes(this.lastAction.action);
  }
}
