import { TestBed } from '@angular/core/testing';

import { TaskNavigatorUltraService } from './task-navigator-ultra.service';

describe('TaskNavigatorUltraService', () => {
  let service: TaskNavigatorUltraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskNavigatorUltraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
