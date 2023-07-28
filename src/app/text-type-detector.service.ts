import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextTypeDetectorService {
  constructor() {}
  isCSV(text: string): boolean {
    // Split the text into lines
    const lines = text.split('\n');

    if (lines.length < 2) {
      // If there's only one line, it can't be CSV
      return false;
    }

    const separator = this.getSeparator(lines);
    const separatorCount = lines[0].split(separator).length;

    // Check if all lines have the same number of separators
    for (let i = 1; i < 3; i++) {
      const lineSeparatorCount1 = lines[i].split(separator).length;
      if (lineSeparatorCount1 < 2) {
        return false;
      }

      if (lineSeparatorCount1 !== separatorCount) {
        return false;
      }
    }

    return true; // If all lines have the same number of separators, it's likely CSV
  }

  getSeparator(lines: string[]) {
    let separator = ',';
    for (let i = 0; i < 3; i++) {
      if (lines[i]) {
        const commasCount = lines[i].split(',').length;
        const tabsCount = lines[i].split('\t').length;

        if (tabsCount > commasCount) {
          separator = '\t'; // Tab separator detected
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
}
