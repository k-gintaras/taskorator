import { Component, Input, SimpleChanges } from '@angular/core';
import { TextTypeDetectorService } from '../services/text-type-detector.service';
import { CsvToTasksService } from '../services/csv-to-tasks.service';
import { TextToTasksService } from '../services/text-to-tasks.service';
import { LocalService } from '../services/local.service';
import { Task, getDefaultTask } from '../task-model/taskModelManager';
import { CodeToTasksService } from '../services/code-to-tasks.service';
import { SyncService } from '../services/sync.service';
import { SelectedOverlordService } from '../services/selected-overlord.service';
import { TaskObjectHelperService } from '../services/task-object-helper.service';

@Component({
  selector: 'app-input-to-tasks',
  templateUrl: './input-to-tasks.component.html',
  styleUrls: ['./input-to-tasks.component.scss'],
})
export class InputToTasksComponent {
  inputText: string = '';
  tasks: Task[] = [];
  overlords: Task[] = [];
  @Input() _defaultParent: string = 'batch tasks';
  suggestion: string = 'batch tasks';
  selectedOverlord: Task | undefined;
  newTaskName: string = '';

  constructor(
    private textTypeService: TextTypeDetectorService,
    private csvService: CsvToTasksService,
    private textService: TextToTasksService,
    private local: LocalService,
    private sync: SyncService,
    private codeService: CodeToTasksService,
    private overlordService: SelectedOverlordService,
    private taskObjectHelper: TaskObjectHelperService
  ) {}

  ngOnInit() {
    this.local.getAllTasks().subscribe((tasks: Task[]) => {
      if (tasks) {
        this.overlords = tasks;
      }
    });
    this.overlordService
      .getSelectedOverlord()
      .subscribe((overlord: Task | null) => {
        if (overlord) {
          this.selectedOverlord = overlord;
          console.log('seleced overlord: ' + overlord.name);
        }
      });
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
  }

  addTask() {
    const newTask: Task = getDefaultTask();
    newTask.name = this.newTaskName;
    this.tasks.push(newTask);
  }

  // get defaultParent(): string {
  //   return this._defaultParent;
  // }

  // set defaultParent(value: string) {
  //   const newDefaultParent = value;
  //   const previousDefaultParent = this._defaultParent;

  //   // Handle the changes here, for example, log the changes
  //   console.log(
  //     `defaultParent changed from '${previousDefaultParent}' to '${newDefaultParent}'`
  //   );

  //   // Update the private variable with the new value
  //   this._defaultParent = value;
  //   this.tasks.forEach((task) => {
  //     task.owner = this.defaultParent;
  //   });
  // }

  getOverlord() {
    let id = 128;
    if (this.selectedOverlord) id = this.selectedOverlord.taskId;
    const t = this.taskObjectHelper.getTaskById(id, this.overlords);
    if (!t) return '';
    return t.name;
  }

  preview() {
    // Trim the input text
    const trimmedText = this.inputText.trim();

    // Check if the text is CSV
    const isCSV = this.textTypeService.isCSV(trimmedText);

    // Check if the text is a list
    const isList = this.textTypeService.isList(trimmedText);
    const isCode = this.textTypeService.isCode(trimmedText);

    // Process based on the detected type
    this.tasks = [];
    if (isCSV) {
      console.log('csv');
      this.tasks = this.csvService.getCsvToTaskObjects(trimmedText);
    } else if (isList && !isCode) {
      this.tasks = this.textService.getLinesToTaskObjects(trimmedText);
    } else if (isCode) {
      console.log('is CODE');

      const className = this.codeService.getClassName(trimmedText);
      if (className) {
        this.suggestion = className;
      }
      const functions = this.codeService.getFunctions(this.inputText.trim());
      this.tasks = this.textService.getCodeToTaskObjects(functions);
    } else {
      this.tasks.push(this.textService.getLineToTaskObject(trimmedText));
    }
    this.addMassTasks(this.tasks);
  }
  addMassTasks(tasks: Task[]) {
    // Code to mass add tasks, e.g.
    this.tasks = [...this.tasks, ...tasks];
  }

  save() {
    this.tasks.forEach((element) => {
      if (element.name) this.sync.createTask(element).subscribe();
      console.log('Saved: ' + element.name);
    });
  }
}
