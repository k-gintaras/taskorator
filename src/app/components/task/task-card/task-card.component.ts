import { Component, Input } from '@angular/core';
import {
  UiTask,
  getDefaultTask,
  getDefaultUiTask,
} from '../../../models/taskModelManager';
import {  NgClass } from '@angular/common';
import { TaskBreadcrumbComponent } from '../task-breadcrumb/task-breadcrumb.component';
import { ColorService } from '../../../services/utils/color.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AiTaskService } from '../../../services/api/ai-task.service';
import { AiApiPromptService } from '../../../services/api/ai-api-prompt.service';
import { AiApiFirebaseService } from '../../../services/core/ai-api-firebase.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [ NgClass, TaskBreadcrumbComponent, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  @Input() task: UiTask | null = getDefaultUiTask();
  @Input() ifShowExtra: boolean = false;

      private taskAssistantId = 'a9308da4-dd17-466e-ab98-752c9764cfab';


  constructor(
    private colorService: ColorService,
    private aiTaskService: AiTaskService,
    // private aiApiFirebase: AiApiFirebaseService,
    private aiApiPrompt: AiApiPromptService
  ) {}

  thereIsTags() {
    const task = this.task;
    return task?.tags && task.tags.length > 0 && Array.isArray(task.tags);
  }

  getAgeBasedBorderColor(): string {
    if (!this.task?.timeCreated) {
      return this.task?.color || '#8b5cf6'; // fallback to purple
    }
    return this.colorService.getDateBasedColor(this.task.timeCreated);
  }

  // onAiSuggestTasks(): void {
  //   if (!this.task?.taskId) {
  //     console.warn('No task ID available');
  //     return;
  //   }
  //   // If AI is not available, attempt to trigger AI API login and continue
  //   if (!this.aiTaskService.isAiAvailable()) {
  //     console.log('AI not available — initiating AI API login flow');
  //     this.aiApiFirebase.loginGoogle();
      
  //     // Wait for successful login, with a timeout
  //     const subscription = this.aiApiFirebase.isLoggedIn$
  //       .pipe(
  //         filter((v) => !!v),
  //         take(1)
  //       )
  //       .subscribe(() => {
  //         console.log('AI API login successful, proceeding with forge');
  //         this._forgeWithAiApi();
  //         subscription.unsubscribe();
  //       });
      
  //     // Timeout after 10 seconds
  //     setTimeout(() => {
  //       if (!this.aiApiFirebase.isCurrentlyLoggedIn()) {
  //         console.warn('AI API login timed out or failed');
  //         alert('⚠️ AI API login failed. Please check the console for details and ensure your domain is authorized in the AI API Firebase project.');
  //         subscription.unsubscribe();
  //       }
  //     }, 10000);
  //     return;
  //   }
  //   this._forgeWithAiApi();
  // }

  // private async _forgeWithAiApi() {
  //   if (!this.task?.taskId) return;
  //   try {
  //     const context = await this.aiTaskService.buildTaskContext(this.task.taskId);
  //     // Prompt engineering: strict instructions for actionable child tasks
  //     const engineeredPrompt = `You are acting as a senior software engineer breaking down work into actionable tasks.\n\nCONTEXT (read-only, do NOT summarise):\n${context}\n\nOBJECTIVE:\nGenerate a clean, minimal set of NEW child tasks under **${this.task.name}** that:\n- Are concrete and executable\n- Are implementation-focused (not vague planning)\n- Fit naturally as siblings of the existing child tasks\n- Do NOT repeat or rephrase existing tasks\n- Do NOT explain context\n- Do NOT invent unrelated features\n\nRULES:\n- Assume Node.js + TypeScript backend\n- Prefer infrastructure, schema, and service boundaries\n- Each task should be something that can be completed in 1–3 coding sessions\n- No more than 6 tasks\n- No emojis, no commentary, no summaries\n\nOUTPUT FORMAT (strict):\n- Bullet list\n- Each bullet is a single task title`;
  //     console.log('═════════════════════════════════════════════════');
  //     console.log(engineeredPrompt);
  //     console.log('═════════════════════════════════════════════════');
  //     // Send engineered prompt to AI API prompt service and log response
  //     const response = await this.aiApiPrompt.callPrompt({
  //       prompt: engineeredPrompt,
  //       id: this.taskAssistantId,
  //       extraInstruction: ''
  //     });
  //     console.log('AI API response:', response);
  //   } catch (err) {
  //     console.error('Failed to build AI context or get AI response:', err);
  //   }
  // }

  private async _forgeWithAiApi() {
  if (!this.task?.taskId) return;

  try {
    const context = await this.aiTaskService.buildTaskContext(this.task.taskId);

    const prompt = [
      `Create NEW child tasks under: "${this.task.name}"`,
      ``,
      `Context (read-only):`,
      context,
      ``,
      `Output: bullet list of task titles only.`
    ].join('\n');

    console.log(prompt)

    const response = await this.aiApiPrompt.callPrompt({
      id: this.taskAssistantId,
      prompt,
      extraInstruction: '' // keep empty unless you need per-call override
    });

    // console.log('AI API response:', response);
  } catch (err) {
    console.error('Failed to build AI context or get AI response:', err);
  }
}


  onXRay(): void {
    // TODO: Open X-Ray view
    // Show all tasks flat from the tree for this task
    console.log('X-Ray clicked for:', this.task?.taskId);
  }
}
