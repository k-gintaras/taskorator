import { Injectable } from '@angular/core';
import { GptTasksService } from './gpt-tasks.service';
import { GptRequestService } from './gpt-request.service';
import { Task } from '../../../models/taskModelManager';
import { TaskListService } from '../../../services/sync-api-cache/task-list.service';
import { TreeService } from '../../../services/sync-api-cache/tree.service';

@Injectable({
  providedIn: 'root',
})
export class GptSuggestService {
  private mainPrompt =
    'Please give me a list of tasks each on a new line. Try to suggest useful ideas without just mentioning what is in the request. Here is additional information for context:';

  constructor(
    private treeService: TreeService,
    private taskListService: TaskListService,
    private gptService: GptRequestService,
    private gptTasksService: GptTasksService
  ) {}

  async suggestTasksForTask(task: Task): Promise<string[]> {
    // if (!taskId || !taskTree) throw new Error('Task ID or Task Tree missing.');

    // const task = await this.taskService.getTaskById(taskId);
    // if (!task) throw new Error('Task not found.');

    const treePath = await this.treeService.findPathStringToTask(task.taskId);
    const relatedTasks = await this.getRelatedTasks(task);
    const request = this.generateGptRequest(treePath, relatedTasks, '', task);

    const response = await this.gptService.makeGptRequest(request);
    const taskList = response.text.split('\n');
    this.addGeneratedTasksToGptService(taskList, task);

    return taskList;
    // return ['taskList'];
  }

  private async getRelatedTasks(task: Task): Promise<Task[]> {
    if (!task.overlord) return [];
    const tasks = await this.taskListService.getOverlordTasks(task.overlord);
    return tasks?.filter((t) => t.stage !== 'completed') || [];
  }

  private generateGptRequest(
    treePath: string,
    relatedTasks: Task[],
    userInput: string,
    task: Task
  ): string {
    const parts: string[] = [this.mainPrompt];

    if (userInput) parts.push(`Current user input: ${userInput}`);
    if (treePath) parts.push(`Tree chain to current task: ${treePath}`);
    if (task.name) parts.push(`Task name: ${task.name}`);
    if (task.why) parts.push(`Task purpose: ${task.why}`);

    if (relatedTasks.length > 0) {
      const taskNames = relatedTasks.map((t) => t.name).join(', ');
      parts.push(`Related tasks already present: ${taskNames}`);
    }

    return parts.join('. ');
  }

  private addGeneratedTasksToGptService(taskList: string[], parentTask: Task) {
    taskList.forEach((taskString) => {
      const newTask = this.createTaskFromResponse(taskString, parentTask);
      this.gptTasksService.addTask(newTask);
    });
  }

  private createTaskFromResponse(response: string, parentTask: Task): Task {
    const task = { ...parentTask };
    const cleanInput = response.replace(/^\d+\.\s*/, '').trim();
    const splitIndex = cleanInput.indexOf(':');

    if (splitIndex !== -1) {
      task.name = cleanInput.substring(0, splitIndex).trim();
      task.todo = cleanInput.substring(splitIndex + 1).trim();
    } else {
      task.name = cleanInput;
      task.todo = '';
    }

    task.overlord = parentTask.taskId;
    return task;
  }
}
