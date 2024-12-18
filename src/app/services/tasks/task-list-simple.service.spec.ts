import { TestBed } from '@angular/core/testing';

import { TaskListSimpleService } from './task-list-simple.service';

describe('TaskListSimpleService', () => {
  let service: TaskListSimpleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskListSimpleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
