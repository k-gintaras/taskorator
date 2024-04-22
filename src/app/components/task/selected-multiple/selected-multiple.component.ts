import { Component, OnInit } from '@angular/core';
import { SelectedMultipleService } from '../../../services/task/selected-multiple.service';
import { Task } from '../../../models/taskModelManager';
import { TaskMiniComponent } from '../../task-mini/task-mini.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selected-multiple',
  standalone: true,
  imports: [TaskMiniComponent, CommonModule],
  templateUrl: './selected-multiple.component.html',
  styleUrl: './selected-multiple.component.scss',
})
export class SelectedMultipleComponent implements OnInit {
  selectedTasks: Task[] = [];
  constructor(private selectedMultiple: SelectedMultipleService) {}
  ngOnInit() {
    this.selectedMultiple
      .getSelectedTasks()
      .subscribe((selectedTasks: Task[]) => {
        this.selectedTasks = selectedTasks;
      });
  }

  onTaskCardClick(task: Task) {
    if (this.selectedTasks.indexOf(task) > -1) {
      this.selectedMultiple.removeSelectedTask(task);
    } else {
      this.selectedMultiple.addSelectedTask(task);
    }
  }
}
