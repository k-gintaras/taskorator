import { TestBed } from '@angular/core/testing';

import { TaskNavigatorService } from './task-navigator.service';

describe('TaskNavigatorService', () => {
  let service: TaskNavigatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskNavigatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
