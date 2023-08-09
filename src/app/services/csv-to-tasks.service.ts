import { Injectable } from '@angular/core';
import { Task, getDefaultTask } from '../task-model/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class CsvToTasksService {
  constructor() {}

  getCsvToTaskObjects(text: string) {
    const lines = text.trim().split('\n');
    let separator = this.getSeparator(lines);
    const headers = lines[0].split(separator);
    const objs = [];
    // Process the data for each row (excluding the header row)
    for (let i = 1; i < lines.length; i++) {
      const rowValues = lines[i].split(separator);
      // Process each column in the row based on the headers
      const rowData: any = {};
      for (let j = 0; j < headers.length; j++) {
        rowData[headers[j]] = rowValues[j];
      }
      const taskObject = this.loadTaskObject(rowData);
      objs.push(taskObject);
    }

    return objs;
  }

  getSeparator(lines: string[]) {
    let separator = ',';
    for (let i = 0; i < 3; i++) {
      const commasCount = lines[i].split(',').length;
      const tabsCount = lines[i].split('\t').length;

      if (tabsCount > commasCount) {
        separator = '\t'; // Tab separator detected
        break;
      }
    }
    return separator;
  }

  loadTaskObject(rowData: any) {
    const t = getDefaultTask();
    t.name = rowData.name;
    t.todo = rowData.todo ? rowData.todo : '';
    t.why = rowData.why + ' ' + rowData.idea;
    t.overlord = rowData['parent or goal'] ? rowData['parent or goal'] : '';
    t.type = rowData.type ? rowData.type : '';
    t.tags = rowData?.tags ? rowData.tags.split(',') : '';
    return t;
  }
}
