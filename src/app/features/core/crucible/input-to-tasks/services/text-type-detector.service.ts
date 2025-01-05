import { Injectable } from '@angular/core';

export enum TextType {
  CSV = 'CSV',
  CSV_LIKE_TASKS = 'CSV_TASKS',
  JSON = 'JSON',
  JSON_LIKE_TASKS = 'JSON_TASKS',
  CODE = 'CODE',
  LIST = 'LIST',
  UNKNOWN = 'UNKNOWN',
}

@Injectable({
  providedIn: 'root',
})
export class TextTypeDetectorService {
  getType(currentInput: string | null): TextType {
    if (!currentInput) return TextType.UNKNOWN;

    if (this.isJSON(currentInput)) {
      return this.isJSONLikeTasks(currentInput)
        ? TextType.JSON_LIKE_TASKS
        : TextType.JSON;
    }

    if (this.isCSV(currentInput)) {
      return this.isCSVLikeTasks(currentInput)
        ? TextType.CSV_LIKE_TASKS
        : TextType.CSV;
    }

    if (this.isCode(currentInput)) {
      return TextType.CODE;
    }

    if (this.isList(currentInput)) {
      return TextType.LIST;
    }

    return TextType.UNKNOWN;
  }

  private isCSV(text: string): boolean {
    const lines = text.split('\n');

    if (lines.length < 2) return false;

    const separator = this.getSeparator(lines);
    const firstLineSeparators = this.countSeparators(lines[0], separator);
    if (firstLineSeparators < 3) return false;

    for (let i = 1; i < lines.length; i++) {
      if (this.countSeparators(lines[i], separator) !== firstLineSeparators) {
        return false;
      }
    }

    return true;
  }

  private isCSVLikeTasks(text: string): boolean {
    const lines = text.split('\n');
    const separator = this.getSeparator(lines);

    if (lines.length < 2) return false;

    const headers = lines[0]
      .split(separator)
      .map((h) => h.trim().toLowerCase());
    const requiredHeaders = ['taskid', 'name', 'status', 'priority']; // Example Task fields

    return requiredHeaders.every((header) => headers.includes(header));
  }

  private isJSON(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  private isJSONLikeTasks(text: string): boolean {
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        return json.every((item) => this.isTaskLikeObject(item));
      } else if (typeof json === 'object') {
        return this.isTaskLikeObject(json);
      }
      return false;
    } catch {
      return false;
    }
  }

  private isCode(text: string): boolean {
    // Allow optional "export" plus class or interface names
    const classOrInterfaceRegex = /(?:export\s+)?(?:class|interface)\s+\w+/;
    // Allow optional access modifier plus method signature
    const methodRegex =
      /\b(?:public|private|protected)?\s+\w+\s*\([^)]*\)\s*\{/;
    return classOrInterfaceRegex.test(text) && methodRegex.test(text);
  }

  private isList(text: string): boolean {
    const lines = text.split('\n').map((line) => line.trim());
    return lines.some((line) => line.length > 0) && lines.length > 1;
  }

  private isTaskLikeObject(obj: any): boolean {
    const requiredFields = ['taskId', 'name', 'status', 'priority']; // Example Task fields
    return requiredFields.every((field) => field in obj);
  }

  private countSeparators(line: string, separator: string): number {
    let count = 0;
    let insideQuote = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') insideQuote = !insideQuote;
      if (!insideQuote && char === separator) count++;
    }

    return count;
  }

  private getSeparator(lines: string[]): string {
    let separator = ',';

    for (const line of lines) {
      if (line) {
        const commas = this.countSeparators(line, ',');
        const tabs = this.countSeparators(line, '\t');

        if (tabs > commas) {
          separator = '\t';
          break;
        }
      }
    }
    return separator;
  }
}
