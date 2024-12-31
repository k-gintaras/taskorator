import { TestBed } from '@angular/core/testing';
import { CsvToTasksService } from './csv-to-tasks.service';

describe('CsvToTasksService', () => {
  let service: CsvToTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CsvToTasksService],
    });

    service = TestBed.inject(CsvToTasksService);
  });

  it('should parse CSV with comma separator', () => {
    const input =
      'Name,Description\nTask1,Do something\nTask2,Do something else';
    const tasks = service.getCsvToTaskLikeObjects(input);

    expect(tasks.length).toBe(2);
    expect(tasks[0].name).toBe('Task1');
    expect(tasks[1].todo).toContain('Do something else');
  });

  it('should detect tab separator', () => {
    const input = 'Name\tDescription\nTask1\tDo something';
    const separator = service.getSeparator(input.split('\n'));
    expect(separator).toBe('\t');
  });
});
