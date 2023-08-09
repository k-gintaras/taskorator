import { TestBed } from '@angular/core/testing';

import { CsvToTasksService } from './csv-to-tasks.service';

describe('CsvToTasksService', () => {
  let service: CsvToTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvToTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
