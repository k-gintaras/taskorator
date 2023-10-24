import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextTypeDetectorService {
  constructor() {}
  isCSV(text: string): boolean {
    const lines = text.split('\n');

    if (lines.length < 2) return false;

    const separator = this.getSeparator(lines);
    const firstLineSeparators = this.countSeparators(lines[0], separator);

    for (let i = 1; i < 3; i++) {
      if (this.countSeparators(lines[i], separator) !== firstLineSeparators) {
        return false;
      }
    }

    return true;
  }

  countSeparators(line: string, separator: string): number {
    let count = 0;
    let insideQuote = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') insideQuote = !insideQuote;
      if (!insideQuote && char === separator) count++;
    }

    return count;
  }

  getSeparator(lines: string[]): string {
    let separator = ',';

    for (let line of lines) {
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

  isList(text: string): boolean {
    // Your logic to check if the text is a list
    // Example: Check if the text contains multiple lines
    return text.includes('\n');
  }

  isCode(text: string) {
    let openBracesCount = 0;
    let closeBracesCount = 0;

    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        openBracesCount++;
      } else if (text[i] === '}') {
        closeBracesCount++;
      }
    }

    return openBracesCount > 1 && closeBracesCount > 1;
  }
}
