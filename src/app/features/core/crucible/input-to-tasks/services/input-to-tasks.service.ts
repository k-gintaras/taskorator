import { Injectable } from '@angular/core';
import { CodeToTasksService } from './code-to-tasks.service';
import { CsvToTasksService } from './csv-to-tasks.service';
import { TextToTasksService } from './text-to-tasks.service';
import {
  TextType,
  TextTypeDetectorService,
} from './text-type-detector.service';
import { TaskoratorTask } from '../../../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class InputToTasksService {
  private currentInput: string = '';
  private inputType: TextType | null = null;
  private tasks: TaskoratorTask[] = [];

  constructor(
    private textTypeService: TextTypeDetectorService,
    private csvService: CsvToTasksService,
    private textService: TextToTasksService,
    private codeService: CodeToTasksService
  ) {}

  /**
   * Sets the input and reparses tasks.
   * @param input - The text input to parse.
   */
  setInput(
    input: string,
    isAutoParse: boolean,
    isFunctionsWithTypes: boolean,
    isLongNamesShortened: boolean
  ): void {
    this.currentInput = input.trim();
    this.inputType = this.textTypeService.getType(this.currentInput);
    if (isAutoParse)
      this.tasks = this.parseTasks(isFunctionsWithTypes, isLongNamesShortened);
  }

  /**
   * Gets the parsed tasks.
   */
  getTasks(): TaskoratorTask[] {
    return this.tasks;
  }

  /**
   * Gets summary information for the current tasks.
   */
  getTaskSummary(): {
    taskCount: number;
    uniqueTaskCount: number;
    inputType: TextType | null;
  } {
    const uniqueTasks = new Set(this.tasks.map((task) => task.name));
    return {
      taskCount: this.tasks.length,
      uniqueTaskCount: uniqueTasks.size,
      inputType: this.inputType,
    };
  }

  /**
   * Parses tasks based on the current input type.
   */
  parseTasks(
    isFunctionsWithTypes: boolean,
    isLongNamesShortened: boolean
  ): TaskoratorTask[] {
    if (!this.currentInput || !this.inputType) {
      console.warn('No input set or invalid input type');
      return [];
    }
    let t: TaskoratorTask[] = [];
    switch (this.inputType) {
      case TextType.CSV:
        t = this.csvService.getCsvToTaskLikeObjects(this.currentInput);
        return t;
      case TextType.CSV_LIKE_TASKS:
        console.warn('not implemented csv tasks to tasks');
        return [];

      case TextType.CODE:
        const strings = this.codeService.extractStringNames(
          this.currentInput,
          isFunctionsWithTypes
        );
        console.warn('not implemented code tasks to tasks');
        console.log(strings.join('\n'));
        return [];

      case TextType.JSON_LIKE_TASKS:
        try {
          const jsonTasks = JSON.parse(this.currentInput);
          // test if they are indeed tasks?
          return jsonTasks;
        } catch (error) {
          console.error('Invalid JSON format', error);
          return [];
        }

      case TextType.LIST:
        t = this.textService.getLinesToTaskLikeObjects(
          this.currentInput,
          isLongNamesShortened
        );
        return t;

      default:
        console.warn('Unrecognized input type');
        return [];
    }
  }
}
