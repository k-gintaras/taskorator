import { TestBed } from '@angular/core/testing';
import { CodeToTasksService } from './code-to-tasks.service';

describe('CodeToTasksService', () => {
  let service: CodeToTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CodeToTasksService],
    });

    service = TestBed.inject(CodeToTasksService);
  });

  describe('getFunctionNames', () => {
    it('should extract lowerCamelCase function names', () => {
      const code = `
        class MyClass {
          myFunction(param: string): void {}
        }

        const myArrowFunction = (param) => param;
      `;
      const names = service.getFunctionNames(code.split('\n'), false);
      expect(names).toEqual(['myFunction', 'myArrowFunction']);
    });

    it('should not include constructor', () => {
      const code = `
        class MyClass {
          constructor() {}
        }
      `;
      const names = service.getFunctionNames(code.split('\n'), false);
      expect(names).toEqual([]);
    });

    it('should return an empty array if no functions are found', () => {
      const code = `
        const x = 10;
        const y = 20;
      `;
      const names = service.getFunctionNames(code.split('\n'), false);
      expect(names).toEqual([]);
    });
  });

  describe('extractStringNames', () => {
    it('should extract all relevant names from code', () => {
      const code = `
        class MyClass {
          myFunction(param: string): void {}
        }

        interface MyInterface {
          myMethod(): void;
        }

        const myArrowFunction = (param) => param;
      `;
      const names = service.extractStringNames(code, false);
      expect(names).toEqual([
        'MyClass',
        'MyInterface',
        'myFunction',
        'myArrowFunction',
      ]);
    });

    it('should return an empty array if no relevant names are found', () => {
      const code = `
        const x = 10;
        const y = 20;
      `;
      const names = service.extractStringNames(code, false);
      expect(names).toEqual([]);
    });
  });
});
