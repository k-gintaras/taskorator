import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CodeToTasksService {
  /**
   * Extracts CamelCase identifiers (class or interface names).
   */
  getClassOrInterfaceNames(lines: string[]): string[] {
    // const camelCaseRegex = /^\s*(class|interface)\s+([A-Z][a-zA-Z0-9]*)/; // Match class or interface
    const camelCaseRegex =
      /^\s*(?:export\s+)?(class|interface)\s+([A-Z][a-zA-Z0-9]*)/;

    return lines
      .map((line) => line.match(camelCaseRegex))
      .filter((match) => match) // Only keep matches
      .map((match) => match![2]); // Extract the name
  }

  /**
   * Extracts lowerCamelCase function/method names.
   */
  getFunctionNames(lines: string[], isWithTypes: boolean): string[] {
    const methodRegex =
      /^\s*([a-z][a-zA-Z0-9]*)\s*\([^)]*\)\s*(?::\s*[a-zA-Z0-9<>\[\]]+)?\s*\{/;
    const arrowFunctionRegex =
      /^\s*const\s+([a-z][a-zA-Z0-9]*)\s*=\s*\([^)]*\)\s*(?::\s*[a-zA-Z0-9<>\[\]]+)?\s*=>/;

    const functions: string[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Match class methods
      if (
        methodRegex.test(trimmedLine) &&
        !trimmedLine.startsWith('constructor')
      ) {
        const splitter = isWithTypes ? '{' : '(';
        const methodName = trimmedLine.split(splitter)[0].trim();
        functions.push(methodName);
      }

      // Match arrow functions
      const arrowMatch = trimmedLine.match(arrowFunctionRegex);
      if (arrowMatch) {
        functions.push(arrowMatch[1]);
      }
    });

    return functions;
  }

  /**
   * Extracts all relevant names from code: classes/interfaces and functions.
   */
  extractStringNames(code: string, isWithTypes: boolean): string[] {
    const lines = code.split('\n').map((line) => line.trim());
    const classOrInterfaceNames = this.getClassOrInterfaceNames(lines);
    const functionNames = this.getFunctionNames(lines, isWithTypes);
    return [...classOrInterfaceNames, ...functionNames];
  }
}
