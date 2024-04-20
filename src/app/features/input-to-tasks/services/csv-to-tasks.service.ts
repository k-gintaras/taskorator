import { Injectable } from '@angular/core';
import { getDefaultTask } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class CsvToTasksService {
  getCsvToTaskObjects(text: string) {
    const lines = text.trim().split('\n');
    const separator = this.getSeparator(lines);
    // const headers = this.splitCsvLine(lines[0], separator);
    const objs = [];

    for (let i = 1; i < lines.length; i++) {
      const rowValues = this.splitCsvLine(lines[i], separator);
      // const rowData: any = {};

      // TODO: using headers might be too complicated (csv to tasks)
      // for (let j = 0; j < headers.length; j++) {
      //   rowData[headers[j]] = rowValues[j];
      // }

      const taskObject = this.loadTaskObject(rowValues, separator);
      objs.push(taskObject);
    }

    return objs;
  }

  getSeparator(lines: string[]) {
    let separator = ',';
    for (let i = 0; i < 3; i++) {
      if (lines[i]) {
        const commas = this.splitCsvLine(lines[i], ',').length;
        const tabs = this.splitCsvLine(lines[i], '\t').length;
        if (tabs > commas) {
          separator = '\t';
          break;
        }
      }
    }
    return separator;
  }

  splitCsvLine(line: string, separator: string): string[] {
    const result: string[] = [];
    // const cursor = 0;
    let insideQuote = false;
    let token = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') insideQuote = !insideQuote;

      if (char === separator && !insideQuote) {
        result.push(token);
        token = '';
      } else {
        token += char;
      }
    }

    if (token) result.push(token);

    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadTaskObject(rowData: any, separator: any) {
    const t = { ...getDefaultTask() };
    t.name = rowData[0] + new Date().getTime();
    t.todo = rowData.join(separator);
    // t.why = rowData.why + ' ' + rowData.idea;
    // t.overlord = rowData['parent or goal'] ? rowData['parent or goal'] : '';
    // t.type = rowData.type ? rowData.type : '';
    // t.tags = rowData?.tags ? rowData.tags.split(',') : '';
    return t;
  }
}
