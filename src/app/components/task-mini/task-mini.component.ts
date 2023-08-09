import { Component, Input } from '@angular/core';
import { LocalService } from 'src/app/services/local.service';
import { TaskObjectHelperService } from 'src/app/services/task-object-helper.service';
import { Task } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-task-mini',
  templateUrl: './task-mini.component.html',
  styleUrls: ['./task-mini.component.scss'],
})
export class TaskMiniComponent {
  @Input() task: Task | undefined;
  @Input() overlord: Task | null | undefined;
  @Input() actionName: string | undefined;
  @Input() onButtonClick: Function | undefined;
  @Input() onSelected: Function | undefined;

  doTask(event: Event, task: Task | undefined) {
    event.stopPropagation();

    if (this.onButtonClick) {
      console.log('Doing: ' + this.actionName + ' to: ' + task?.name);
      this.onButtonClick(task);
    }

    // if(this.action===Acti)
  }
}
