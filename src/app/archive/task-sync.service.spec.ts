import { TestBed } from '@angular/core/testing';

import { TaskSyncService } from './task-sync.service';

describe('TaskSyncService', () => {
  let service: TaskSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
