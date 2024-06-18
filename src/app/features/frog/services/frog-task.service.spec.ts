import { TestBed } from '@angular/core/testing';

import { FrogTaskService } from './frog-task.service';

describe('FrogTaskService', () => {
  let service: FrogTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FrogTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
