import { TestBed } from '@angular/core/testing';

import { TaskObjectHelperService } from './task-object-helper.service';

describe('TaskObjectHelperService', () => {
  let service: TaskObjectHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskObjectHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
