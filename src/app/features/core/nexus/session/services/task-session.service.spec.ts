import { TestBed } from '@angular/core/testing';

import { TaskSessionService } from './task-session.service';

describe('TaskSessionService', () => {
  let service: TaskSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
