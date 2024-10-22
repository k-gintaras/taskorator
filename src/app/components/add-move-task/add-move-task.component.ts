import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { getDefaultTask, Task } from '../../models/taskModelManager';
import { TaskService } from '../../services/task/task.service';
import { SelectedMultipleService } from '../../services/task/selected-multiple.service';
import { ErrorService } from '../../services/core/error.service';
import { MatIcon } from '@angular/material/icon';
import { FormsModule, NgModel } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CurrentInputService } from '../../services/current-input.service';
import { GptCreateComponent } from '../../features/gpt/gpt-create/gpt-create.component';
import { SelectedOverlordService } from '../../services/task/selected-overlord.service';

/**
 * @deprecated This component/service is deprecated and will be removed in future releases.
 * will be split into, CREATE templates and browse templates with ability to add...
 */
@Component({
  selector: 'app-add-move-task',
  templateUrl: './add-move-task.component.html',
  styleUrls: ['./add-move-task.component.scss'],
  standalone: true,
  imports: [MatIcon, FormsModule, MatCardContent, MatCard, GptCreateComponent],
})
export class AddMoveTaskComponent implements OnInit {
  @Input() overlord: Task | undefined;
  newTask: Task = getDefaultTask();
  selectedOverlord: Task | undefined;

  constructor(
    private taskService: TaskService,
    private selectedService: SelectedMultipleService,
    private feedbackService: ErrorService,
    private currentInputService: CurrentInputService,
    private selectedOverlordService: SelectedOverlordService
  ) {}

  ngOnInit(): void {
    this.selectedOverlordService
      .getSelectedOverlordObservable()
      .subscribe((t: Task | null) => {
        if (t) {
          this.selectedOverlord = t;
        }
      });
  }

  // we do it so we can reuse this input for gpt request, so we don't have to have multiple different inputs
  onInputChange() {
    this.currentInputService.updateCurrentInput(this.newTask.name);
  }

  createTask() {
    const newTask: Task = { ...this.newTask }; // Clone

    if (this.overlord) {
      newTask.overlord = this.overlord.taskId;
    } else {
      newTask.overlord = '128'; // Your default Overlord ID
    }
    this.taskService.createTask(newTask).then((result) => {
      this.newTask = getDefaultTask();
    });
  }

  async createAndMove() {
    const newTask: Task = { ...this.newTask }; // Clone

    if (this.overlord) {
      newTask.overlord = this.overlord.taskId;
    } else {
      newTask.overlord = '128'; // Your default Overlord ID
    }

    try {
      // new functionality
      // if name is empty, just add tasks to the overlord instead of a new task in the overlord
      let newOverlord = this.overlord;
      if (newTask.name.length > 0) {
        newOverlord = await this.taskService.createTask(newTask); // Promise<Task>;
      }

      const selectedTasks = await firstValueFrom(
        this.selectedService.getSelectedTasks()
      ); // Assuming getSelectedTasks returns Observable<Task[]>

      if (selectedTasks && newOverlord) {
        for (const task of selectedTasks) {
          task.overlord = newOverlord.taskId;
        }
        this.taskService.updateTasks(selectedTasks);

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
