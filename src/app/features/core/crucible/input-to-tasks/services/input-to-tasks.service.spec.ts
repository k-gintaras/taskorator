import { TestBed } from '@angular/core/testing';
import { InputToTasksService } from './input-to-tasks.service';
import {
  TextTypeDetectorService,
  TextType,
} from './text-type-detector.service';
import { CsvToTasksService } from './csv-to-tasks.service';
import { TextToTasksService } from './text-to-tasks.service';
import { CodeToTasksService } from './code-to-tasks.service';
import { getDefaultTaskCustomized } from '../../../../../test-files/test-data/test-task';

describe('InputToTasksService', () => {
  let service: InputToTasksService;
  let mockTextTypeDetector: jasmine.SpyObj<TextTypeDetectorService>;
  let mockCsvService: jasmine.SpyObj<CsvToTasksService>;
  let mockTextService: jasmine.SpyObj<TextToTasksService>;
  let mockCodeService: jasmine.SpyObj<CodeToTasksService>;

  beforeEach(() => {
    mockTextTypeDetector = jasmine.createSpyObj('TextTypeDetectorService', [
      'getType',
    ]);
    mockCsvService = jasmine.createSpyObj('CsvToTasksService', [
      'getCsvToTaskLikeObjects',
    ]);
    mockTextService = jasmine.createSpyObj('TextToTasksService', [
      'getLinesToTaskLikeObjects',
    ]);
    mockCodeService = jasmine.createSpyObj('CodeToTasksService', [
      'extractStringNames',
    ]);

    TestBed.configureTestingModule({
      providers: [
        InputToTasksService,
        { provide: TextTypeDetectorService, useValue: mockTextTypeDetector },
        { provide: CsvToTasksService, useValue: mockCsvService },
        { provide: TextToTasksService, useValue: mockTextService },
        { provide: CodeToTasksService, useValue: mockCodeService },
      ],
    });

    service = TestBed.inject(InputToTasksService);
  });

  it('should set input and auto-parse tasks', () => {
    const input = 'Task1,Task2,Task3';
    mockTextTypeDetector.getType.and.returnValue(TextType.CSV);
    mockCsvService.getCsvToTaskLikeObjects.and.returnValue([
      getDefaultTaskCustomized({ name: 'Task1' }),
      getDefaultTaskCustomized({ name: 'Task2' }),
    ]);

    service.setInput(input, true, false, false);
    const tasks = service.getTasks();

    expect(mockTextTypeDetector.getType).toHaveBeenCalledWith(input);
    expect(mockCsvService.getCsvToTaskLikeObjects).toHaveBeenCalledWith(input);
    expect(tasks.length).toBe(2);
    expect(tasks[0].name).toBe('Task1');
  });

  it('should return task summary', () => {
    const input = 'Task1,Task2,Task1';
    mockTextTypeDetector.getType.and.returnValue(TextType.CSV);
    mockCsvService.getCsvToTaskLikeObjects.and.returnValue([
      getDefaultTaskCustomized({ name: 'Task1' }),
      getDefaultTaskCustomized({ name: 'Task2' }),
      getDefaultTaskCustomized({ name: 'Task1' }),
    ]);

    service.setInput(input, true, false, false);
    const summary = service.getTaskSummary();

    expect(summary.taskCount).toBe(3);
    expect(summary.uniqueTaskCount).toBe(2);
    expect(summary.inputType).toBe(TextType.CSV);
  });
});
