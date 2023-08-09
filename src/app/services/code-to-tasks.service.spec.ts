import { TestBed } from '@angular/core/testing';

import { CodeToTasksService } from './code-to-tasks.service';

describe('CodeToTasksService', () => {
  let service: CodeToTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeToTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
