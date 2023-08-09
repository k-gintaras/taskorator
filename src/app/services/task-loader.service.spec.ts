import { TestBed } from '@angular/core/testing';

import { TaskLoaderService } from './task-loader.service';

describe('TaskLoaderService', () => {
  let service: TaskLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
