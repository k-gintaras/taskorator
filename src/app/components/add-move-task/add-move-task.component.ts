import { Component, Input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FeedbackService } from 'src/app/services/feedback.service';
import { SelectedMultipleService } from 'src/app/services/selected-multiple.service';
import { TaskService } from 'src/app/services/task.service';
import { Task, getDefaultTask } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-add-move-task',
  templateUrl: './add-move-task.component.html',
  styleUrls: ['./add-move-task.component.css'],
})
export class AddMoveTaskComponent {
  @Input() overlord: Task | undefined;
  newTask: Task = getDefaultTask();

  constructor(
    private taskService: TaskService,
    private selectedService: SelectedMultipleService,
    private feedbackService: FeedbackService
  ) {}

  createTask() {
    const newTask: Task = { ...this.newTask }; // Clone

    if (this.overlord) {
      newTask.overlord = this.overlord.taskId;
    } else {
      newTask.overlord = '128'; // Your default Overlord ID
    }
    this.taskService.create(newTask);
  }

  async createAndMove() {
    const newTask: Task = { ...this.newTask }; // Clone

    if (this.overlord) {
      newTask.overlord = this.overlord.taskId;
    } else {
      newTask.overlord = '128'; // Your default Overlord ID
    }

    try {
      const newOverlord = await firstValueFrom(
        this.taskService.createGetId(newTask)
      ); // Assuming createGetId returns Observable<TaskResponse | null>

      const selectedTasks = await firstValueFrom(
        this.selectedService.getSelectedTasks()
      ); // Assuming getSelectedTasks returns Observable<Task[]>

      if (selectedTasks && newOverlord) {
        for (const task of selectedTasks) {
          task.overlord = newOverlord.taskId;
          this.taskService.update(task);
        }
        this.tell('Updated multiple tasks.');
      } else {
        this.tell("Can't update empty tasks or failed to create new overlord.");
      }
    } catch (error) {
      // Handle any errors that might occur
      console.error('Error occurred while creating or moving tasks:', error);
    }
  }

  tell(str: string) {
    this.feedbackService.log(str);
  }
}
