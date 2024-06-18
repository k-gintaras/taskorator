import { TestBed } from '@angular/core/testing';

import { FreshTaskService } from './fresh-task.service';

describe('FreshTaskService', () => {
  let service: FreshTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreshTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
