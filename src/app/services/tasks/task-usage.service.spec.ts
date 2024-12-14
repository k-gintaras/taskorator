import { TestBed } from '@angular/core/testing';

import { TaskUsageService } from './task-usage.service';

describe('TaskUsageService', () => {
  let service: TaskUsageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskUsageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
