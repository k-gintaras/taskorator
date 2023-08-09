import { TestBed } from '@angular/core/testing';

import { TaskOverlordFixerService } from './task-overlord-fixer.service';

describe('TaskOverlordFixerService', () => {
  let service: TaskOverlordFixerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskOverlordFixerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
