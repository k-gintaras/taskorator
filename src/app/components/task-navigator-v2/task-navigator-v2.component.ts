import { Component, Input, OnInit } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export interface Task {
  taskId: string;
  title?: string;
  why?: string;
  todo?: string;
  timeCreated: Date;
  completed?: boolean;
  children?: Task[];
}

export interface TaskStatus {
  status: 'viewed' | 'updated' | 'new';
  progress: number;
}

@Component({
  selector: 'app-task-navigator-v2',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule
],
  templateUrl: './task-navigator-v2.component.html',
  styleUrl: './task-navigator-v2.component.scss'
})
export class TaskNavigatorV2Component implements OnInit {
  @Input() tasks: Task[] = [];
  @Input() currentTask?: Task;
  @Input() selectedTaskId?: string;

  // Mock data for demonstration
  mockTasks: Task[] = [
    {
      taskId: '1',
      title: 'Design System Implementation',
      why: 'Ensure consistency across components',
      todo: 'Create reusable design tokens and patterns',
      timeCreated: new Date('2025-08-01'),
      completed: false,
      children: [
        {
          taskId: '1.1',
          title: 'Color System',
          todo: 'Define semantic color palette',
          timeCreated: new Date('2025-08-01'),
          completed: true
        }
      ]
    },
    {
      taskId: '2',
      title: 'Mobile Navigation',
      why: 'Improve mobile user experience',
      todo: 'Implement responsive navigation patterns',
      timeCreated: new Date('2025-08-02'),
      completed: false
    },
    {
      taskId: '3',
      title: 'Performance Optimization',
      why: 'Faster load times improve user satisfaction',
      todo: 'Implement lazy loading and caching',
      timeCreated: new Date('2025-08-03'),
      completed: false
    }
  ];

  ngOnInit() {
    // Use mock data if no tasks provided
    if (!this.tasks || this.tasks.length === 0) {
      this.tasks = this.mockTasks;
    }
  }

  getDateBasedColor(date: Date): string {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Color gradient based on age
    if (diffDays <= 1) return '#27ae60'; // Green for recent
    if (diffDays <= 3) return '#007bff'; // Blue for medium
    if (diffDays <= 7) return '#ffc107'; // Yellow for old
    return '#c0392b'; // Red for very old
  }

  getProgressPercent(task: Task): number {
    if (!task.children || task.children.length === 0) {
      return task.completed ? 100 : 0;
    }
    
    const completedChildren = task.children.filter(child => child.completed).length;
    return Math.round((completedChildren / task.children.length) * 100);
  }

  getTaskStatus(taskId: string): 'viewed' | 'updated' | 'new' {
    // Mock status logic - in real app this would come from service
    const random = Math.random();
    if (random < 0.3) return 'viewed';
    if (random < 0.6) return 'updated';
    return 'new';
  }

  isSelected(task: Task): boolean {
    return task.taskId === this.selectedTaskId;
  }

  onSelectTask(task: Task): void {
    this.selectedTaskId = task.taskId;
    // Emit event or call service to handle task selection
  }

  onNavigateToTask(task: Task): void {
    // Handle navigation to task details
    console.log('Navigating to task:', task.title);
  }

  onCompleteTask(task: Task): void {
    task.completed = !task.completed;
    // Call service to update task completion
  }

  hasChildren(task: Task): boolean {
    return !!(task.children && task.children.length > 0);
  }

  getCompletedCount(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  trackByTaskId(index: number, task: Task): string {
    return task.taskId;
  }
}
