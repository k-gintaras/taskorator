import { Component, Input } from '@angular/core';
import { SelectedOverlordService } from 'src/app/services/selected-overlord.service';
import { Task, getDefaultTask } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-select-overlord',
  templateUrl: './select-overlord.component.html',
  styleUrls: ['./select-overlord.component.css'],
})
export class SelectOverlordComponent {
  filteredOverlords: Task[] = [];
  @Input() overlords: Task[] = [];
  task: Task = getDefaultTask();

  constructor(private overlordService: SelectedOverlordService) {}

  taskChanged() {
    const selectedOverlord = this.overlords.find(
      (o) => o.taskId === this.task.overlord
    );
    if (selectedOverlord) {
      this.overlordService.setSelectedOverlord(selectedOverlord);
    }
  }

  filterOverlordTasks(event: any) {
    this.filteredOverlords = this.overlordService.filterOverlordTasks(
      event,
      this.filteredOverlords
    );
  }
}
