import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagManagerModule } from '@ubaby/componentator';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { TaskCacheService } from '../../services/cache/task-cache.service';
import { UiTask } from '../../models/taskModelManager';

@Component({
  selector: 'app-test-task-tagging',
  standalone: true,
  imports: [TagManagerModule, CommonModule],
  templateUrl: './test-task-tagging.component.html',
  styleUrls: ['./test-task-tagging.component.scss'],
})
export class TestTaskTaggingComponent implements OnInit {
  tagGroups: { id: string; name: string; tags: { id: string; label: string }[] }[] = [];
  items: { id: string; label: string; tags: { id: string; label: string }[]; originalTask: UiTask }[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private taskService: TaskService, private taskCache: TaskCacheService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.loadRealData();
    } catch (error) {
      this.errorMessage = `Failed to load tasks: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('Error loading tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadRealData(): Promise<void> {
    try {
      // Get tasks from the cache (TaskService does not expose getTasks)
      const allTasks = this.taskCache.getAllTasks();

      if (!allTasks || allTasks.length === 0) {
        this.errorMessage = 'No tasks available to tag';
        return;
      }

      // Extract unique tags from all tasks
      const tagSet = new Set<string>();
      allTasks.forEach((task: UiTask) => {
        if (task.tags && Array.isArray(task.tags)) {
          task.tags.forEach((tag: string) => tagSet.add(tag));
        }
      });

      // Create tag groups
      const allTags = Array.from(tagSet);
      this.tagGroups = [
        {
          id: 'all-tags',
          name: 'All Tags',
          tags: allTags.map((tag) => ({
            id: tag,
            label: tag,
          })),
        },
      ];

      // Map tasks to items for the tag manager
      this.items = allTasks.map((task: UiTask) => ({
        id: task.taskId,
        label: task.name || 'Untitled Task',
        tags: (task.tags || []).map((tag: string) => ({ id: tag, label: tag })),
        originalTask: task, // Keep reference to original task
      }));
    } catch (error) {
      console.error('Error loading real data:', error);
      throw error;
    }
  }

  onTagAdded(event: any): void {
    console.log('Tag added to item:', event);
    // Handle tag added event
    if (event.itemId && event.tagId) {
      const item = this.items.find((i) => i.id === event.itemId);
      if (item && item.originalTask) {
        if (!item.originalTask.tags) {
          item.originalTask.tags = [];
        }
        if (!item.originalTask.tags.includes(event.tagId)) {
          item.originalTask.tags.push(event.tagId);
          console.log(`Tag '${event.tagId}' added to task '${item.label}'`);
        }
      }
    }
  }

  onTagRemoved(event: any): void {
    console.log('Tag removed from item:', event);
    // Handle tag removed event
    if (event.itemId && event.tagId) {
      const item = this.items.find((i) => i.id === event.itemId);
      if (item && item.originalTask) {
        if (item.originalTask.tags) {
          const index = item.originalTask.tags.indexOf(event.tagId);
          if (index > -1) {
            item.originalTask.tags.splice(index, 1);
            console.log(`Tag '${event.tagId}' removed from task '${item.label}'`);
          }
        }
      }
    }
  }
}
