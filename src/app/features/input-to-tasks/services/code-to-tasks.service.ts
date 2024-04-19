import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CodeToTasksService {
  getClassName(s: string) {
    const lines = s.split('\n');
    let classInfo = '';
    let isClassFound = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!isClassFound && line.includes('class ') && line.includes('{')) {
        let className = line.replace('export', '');
        className = className.replace('class', '');
        className = className.trim();
        className = className.slice(0, className.indexOf('{')).trim();
        classInfo = className;
        isClassFound = true;
      }
    }
    return classInfo;
  }

  getFunctions(s: string) {
    const className = this.getClassName(s);
    const functions = [];
    const lines = s.split('\n');
    let indentation = 0;
    if (className) {
      indentation = 1;
    }
    let currentIndentation = 0;
    // TODO: says useless escape on regex
    const functionRegex =
      // eslint-disable-next-line no-useless-escape
      /[a-zA-Z_]\w*\([^)]*\)\s?(?::\s*([\w|<>[\]\| |<\>]+))?/;

    for (const line of lines) {
      const functionMatch = line.match(functionRegex);

      if (functionMatch) {
        if (currentIndentation === indentation) {
          // currentFunction = functionName;
          functions.push(functionMatch[0]);
        }
      }

      const openCurlyBraces = line.split('{').length - 1;
      const closedCurlyBraces = line.split('}').length - 1;
      currentIndentation += openCurlyBraces - closedCurlyBraces;
    }

    return functions.join('\n');
  }
}
