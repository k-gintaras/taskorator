import { Component } from '@angular/core';
import { TextTypeDetectorService } from '../text-type-detector.service';
import { CsvToTasksService } from '../csv-to-tasks.service';
import { TextToTasksService } from '../text-to-tasks.service';
import { TaskService } from 'src/task.service';

@Component({
  selector: 'app-input-to-tasks',
  templateUrl: './input-to-tasks.component.html',
  styleUrls: ['./input-to-tasks.component.css'],
})
export class InputToTasksComponent {
  inputText: string = '';
  constructor(
    private textTypeService: TextTypeDetectorService,
    private csvService: CsvToTasksService,
    private textService: TextToTasksService,
    private taskService: TaskService
  ) {}

  processText() {
    // Trim the input text
    const trimmedText = this.inputText.trim();

    // Check if the text is CSV
    const isCSV = this.textTypeService.isCSV(trimmedText);

    // Check if the text is a list
    const isList = this.textTypeService.isList(trimmedText);

    // Process based on the detected type
    if (isCSV) {
      console.log('csv');
      const tasks = this.csvService.processCSVCustom(trimmedText);
      tasks.forEach((element) => {
        if (element.name) this.taskService.createTask(element).subscribe();
        console.log('Saved: ' + element.name);
      });
    } else if (isList) {
      this.textService.processList(trimmedText);
    } else {
      this.textService.processSingleLine(trimmedText);
    }
  }
}
