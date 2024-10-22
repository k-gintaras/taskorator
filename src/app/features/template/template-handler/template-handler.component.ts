import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskTemplate } from '../models/template';
import { TemplateService } from '../services/template.service';
import { TaskService } from '../../../services/task/task.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
/**
 * @deprecated This component/service is deprecated and will be removed in future releases.
 * will be split into, CREATE templates and browse templates with ability to add...
 */
@Component({
  selector: 'app-template-handler',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './template-handler.component.html',
  styleUrls: ['./template-handler.component.scss'],
})
export class TemplateHandlerComponent implements OnInit {
  template: TaskTemplate | null = null;
  selectedOverlordId: string = '';

  constructor(
    private route: ActivatedRoute,
    private templateService: TemplateService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    // Get templateId from URL
    this.route.queryParams.subscribe((params) => {
      const templateId = params['templateId'];
      if (templateId) {
        this.loadTemplate(templateId);
      } else {
        // const id = '';
        // this.loadTemplate(id);
        console.log('test tempalte reqtrieval');
      }
    });
  }

  async loadTemplate(templateId: string): Promise<void> {
    try {
      this.template = await this.templateService.getTemplate(templateId);
    } catch (error) {
      console.error('Error loading template:', error);
    }
  }

  async addTasksToOverlord(): Promise<void> {
    if (this.template && this.selectedOverlordId) {
      for (const task of this.template.tasks) {
        task.overlord = this.selectedOverlordId; // Set the overlord ID
        await this.taskService.createTask(task); // Create task under the selected overlord
      }
      alert('Tasks added successfully!');
    } else {
      alert('Please select an overlord and load a template.');
    }
  }
}
