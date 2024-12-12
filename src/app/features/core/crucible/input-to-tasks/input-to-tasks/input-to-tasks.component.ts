import { Component, Input, OnInit } from '@angular/core';
import { TextTypeDetectorService } from '../services/text-type-detector.service';
import { CsvToTasksService } from '../services/csv-to-tasks.service';
import { TextToTasksService } from '../services/text-to-tasks.service';
import { CodeToTasksService } from '../services/code-to-tasks.service';
import { TaskObjectHelperService } from '../services/task-object-helper.service';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgFor } from '@angular/common';
import {
  Task,
  getDefaultTask,
  ROOT_TASK_ID,
} from '../../../../../models/taskModelManager';
import { SelectedOverlordService } from '../../../../../services/task/selected-overlord.service';
@Component({
  selector: 'app-input-to-tasks',
  standalone: true,
  imports: [
    NgFor,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatLabel,
    MatCheckbox,
    MatIcon,
    MatFormField,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './input-to-tasks.component.html',
  styleUrls: ['./input-to-tasks.component.scss'],
})
export class InputToTasksComponent implements OnInit {
  inputText = '';
  tasks: Task[] = [];
  overlords: Task[] = [];
  @Input() _defaultParent = 'batch tasks';
  suggestion = 'batch tasks';
  selectedOverlord: string | null = '';
  newTaskName = '';
  isShortened = false;
  isOnlyUniques = false;

  constructor(
    private textTypeService: TextTypeDetectorService,
    private csvService: CsvToTasksService,
    private textService: TextToTasksService,
    private codeService: CodeToTasksService,
    private overlordService: SelectedOverlordService,
    private taskObjectHelper: TaskObjectHelperService
  ) {}

  ngOnInit() {
    // TODO: input to tasks, allow a list of overlords from a tree service
    // this.local.getAllTasks().subscribe((tasks: Task[]) => {
    //   if (tasks) {
    //     this.overlords = tasks;
    //   }
    // });
    this.overlordService
      .getSelectedOverlordObservable()
      .subscribe((overlord: string | null) => {
        if (overlord) {
          this.selectedOverlord = overlord;
        }
      });
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
  }

  trimAction() {
    this.tasks.forEach((t) => {
      t.name.trim();
      t.todo.trim();
    });
    this.preview();
  }

  ensureUniques() {
    // Create a map to track unique names
    const nameMap = new Map<string, number>();

    this.tasks.forEach((task) => {
      if (nameMap.has(task.name)) {
        // If the name already exists, append a timestamp
        task.name += ' ' + new Date().getTime();
      } else {
        // Track this name
        nameMap.set(task.name, 1);
      }
    });

    // this.preview();
  }

  addTask() {
    const newTask: Task = getDefaultTask();
    if (this.newTaskName?.length > 0) {
      newTask.name = this.newTaskName;
      const exists =
        -1 !==
        this.tasks.findIndex((task) => {
          task.name === this.newTaskName;
        });
      if (!exists) {
        this.tasks.unshift(newTask);
      }
    }
  }

  getOverlord() {
    let id = ROOT_TASK_ID;
    if (this.selectedOverlord) id = this.selectedOverlord;
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
      this.tasks = this.textService.getLinesToTaskObjects(
        trimmedText,
        this.isShortened
      );
    } else if (isCode) {
      console.log('is CODE');

      const className = this.codeService.getClassName(trimmedText);
      if (className) {
        this.suggestion = className;
      }
      const functions = this.codeService.getFunctions(this.inputText.trim());
      this.tasks = this.textService.getCodeToTaskObjects(functions);
    } else {
      this.tasks.push(
        this.textService.getLineToTaskObject(trimmedText, this.isShortened)
      );
    }

    this.tasks = this.addMassTasks(this.tasks, this.isOnlyUniques);
  }

  /**
   *
   * @param tasks tasks to add
   * @return unique non empty tasks (not really return though)
   */
  addMassTasks(newTasks: Task[], onlyUniques: boolean) {
    if (onlyUniques) {
      return this.getUniqueTasks(newTasks);
    } else {
      return this.ensureUniqueTaskNames(newTasks);
    }
  }

  getUniqueTasks(tasks: Task[]): Task[] {
    const uniqueNames = new Set();
    const uniqueTasks: Task[] = [];

    for (const task of tasks) {
      if (!uniqueNames.has(task.name)) {
        uniqueNames.add(task.name);
        uniqueTasks.push(task);
      }
    }

    return uniqueTasks;
  }

  // Ensures that all tasks have unique names by appending a timestamp to duplicates.
  ensureUniqueTaskNames(tasks: Task[]): Task[] {
    const uniqueNames = new Set<string>();
    const updatedTasks: Task[] = [];

    for (const task of tasks) {
      let uniqueName = task.name;
      if (uniqueNames.has(task.name)) {
        uniqueName = `${task.name}_${new Date().getTime()}`;
      }
      uniqueNames.add(uniqueName);

      const updatedTask = { ...task, name: uniqueName };
      updatedTasks.push(updatedTask);
    }

    return updatedTasks;
  }

  save() {
    this.tasks.forEach((element) => {
      let overlordId = ROOT_TASK_ID;
      if (this.selectedOverlord) {
        overlordId = this.selectedOverlord;
      }
      element.overlord = overlordId;

      // TODO: allow saving in inputs to tasks, update the method with taskservice
      // if (element.name) this.sync.createTask(element).subscribe();
      // console.log('Saved: ' + element.name);
    });
  }
}
