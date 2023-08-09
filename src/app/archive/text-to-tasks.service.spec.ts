import { TestBed } from '@angular/core/testing';

import { TextToTasksService } from './text-to-tasks.service';

describe('TextToTasksService', () => {
  let service: TextToTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextToTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
