import { Component, OnInit } from '@angular/core';
import {
  getDefaultTask,
  TaskoratorTask,
} from '../../../models/taskModelManager';
import { TaskTree } from '../../../models/taskTree';
import { SelectedOverlordService } from '../../../services/tasks/selected/selected-overlord.service';
import { TreeService } from '../../../services/sync-api-cache/tree.service';
import { CurrentInputService } from '../../../services/current-input.service';
import { GptRequestService } from '../services/gpt-request.service';
import { NgIf } from '@angular/common';
import { GptTasksService } from '../services/gpt-tasks.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../services/sync-api-cache/task.service';
import { TaskListService } from '../../../services/sync-api-cache/task-list.service';
import { SessionManagerService } from '../../../services/session-manager.service';

@Component({
  selector: 'app-gpt-create',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatIcon, MatProgressSpinnerModule],
  templateUrl: './gpt-create.component.html',
  styleUrl: './gpt-create.component.scss',
})
export class GptCreateComponent implements OnInit {
  currentOverlordId: string | undefined;
  taskTree: TaskTree | undefined;
  prompt: string | undefined;
  mainPrompt =
    'please give me a list of tasks, that are on new line each, try suggest useful ideas without just mentioning what is in the request please: ';

  isLoading = false;
  result: string[] | null = null;
  canUseComponent: boolean = true;

  constructor(
    private selectedOverlordService: SelectedOverlordService,
    private treeService: TreeService,
    private currentInputService: CurrentInputService,
    private taskService: TaskService,
    private taskListService: TaskListService,
    private gptService: GptRequestService,
    private gptTasksService: GptTasksService,
    private sessionService: SessionManagerService
  ) {}

  ngOnInit(): void {
    // this.selectedOverlordService
    //   .getSelectedOverlordObservable()
    //   .subscribe((t: string | null) => {
    //     if (!t) return;
    //     this.currentOverlordId = t;
    //   });

    this.treeService.getTree().subscribe((tree) => {
      if (!tree) return;
      this.taskTree = tree;
    });

    this.currentInputService
      .getCurrentInput()
      .subscribe((input) => (this.prompt = input));

    const sessionType = this.sessionService.getSessionType();
    if (sessionType === 'offline') {
      this.canUseComponent = false;
    }
  }

  async getSuggestion() {
    if (!this.canUseComponent) alert('Must login online to use gpt');
    const overlordId = this.currentOverlordId;
    if (!overlordId) {
      console.log('Missing userId or selectedOverlord.');
      return;
    }

    const tree = this.taskTree;

    if (!tree) {
      console.log('Missing tree.');
      return;
    }

    this.isLoading = true;

    try {
      if (!this.currentOverlordId) return;
      const overlord = await this.taskService.getTaskById(
        this.currentOverlordId
      );
      if (!overlord) return;

      const treeChain = await this.getTreeChain(overlord, tree);
      const tasks = await this.getOverlordChildren(overlord);
      const currentInput = this.prompt || '';
      const request = this.generatePromptRequest(
        treeChain,
        tasks,
        currentInput,
        overlord
      );
      const response = await this.gptService.makeGptRequest(request);
      this.result = response.text.split('\n');
      this.result?.forEach((t: string) => {
        const task = this.getTaskFromResponse(t, overlord);
        this.gptTasksService.addTask(task);
      });
    } catch (error) {
      console.error('Error in getSuggestion():', error);
    } finally {
      this.isLoading = false;
    }
  }

  getTaskFromResponse(t: string, overlord: TaskoratorTask): TaskoratorTask {
    const task = getDefaultTask();
    if (!overlord) return task;

    // Remove leading numbers and trim the result
    const cleanInput = t.replace(/^\d+\.\s*/, '').trim();

    // Split the input string into name and todo parts
    // Assuming the format is "Task Name: Task Description."
    const splitIndex = cleanInput.indexOf(':');
    if (splitIndex !== -1) {
      task.name = cleanInput.substring(0, splitIndex).trim();
      task.todo = cleanInput.substring(splitIndex + 1).trim();
    } else {
      // Fallback if no colon is found
      // if task designed as long task then we can't really do much to make it more readable
      task.name = cleanInput; // First three words

      // const words = cleanInput.split(' ');
      // task.name = words.slice(0, 3).join(' '); // First three words
      // task.todo = words.slice(3).join(' '); // Rest of the words
    }

    task.overlord = overlord.taskId;

    return task;
  }

  private generatePromptRequest(
    treeChain: string,
    tasks: TaskoratorTask[],
    currentInput: string,
    overlord: TaskoratorTask
  ): string {
    const mainPrompt = this.getMainPrompt();
    const parts: string[] = [mainPrompt];

    if (currentInput) {
      parts.push(`Current user input: ${currentInput}`);
    }

    if (treeChain) {
      parts.push(`Tree chain to current overlord: ${treeChain}`);
    }

    if (overlord?.name) {
      parts.push(`Selected overlord name: ${overlord.name}`);
    }

    if (overlord?.why) {
      parts.push(`Selected overlord why: ${overlord.why}`);
    }

    if (tasks && tasks.length > 0) {
      const tasksList = tasks.map((t) => t.name).join(', ');
      parts.push(`Tasks already there and are related: ${tasksList}`);
    }

    return parts.join('. ');
  }

  private getMainPrompt(): string {
    return 'Please give me a list of tasks each on a new line. Try to suggest useful ideas without just mentioning what is in the request. Here is additional information for context: ';
  }

  private async getTreeChain(
    overlord: TaskoratorTask,
    tree: TaskTree
  ): Promise<string> {
    if (!tree || !overlord) {
      return '';
    }

    return this.treeService.findPathStringToTask(overlord.taskId);
  }

  private async getOverlordChildren(
    overlord: TaskoratorTask
  ): Promise<TaskoratorTask[]> {
    if (!overlord) {
      return [];
    }
    const tasks = await this.taskListService.getOverlordTasks(overlord.taskId);
    const filtered = tasks?.filter((t) => {
      t.stage !== 'completed';
    });

    return filtered ? filtered : [];
  }
}
