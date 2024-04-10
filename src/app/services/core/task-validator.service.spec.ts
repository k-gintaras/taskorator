import { TestBed } from '@angular/core/testing';

import { TaskValidatorService } from './task-validator.service';

describe('TaskValidatorService', () => {
  let service: TaskValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
