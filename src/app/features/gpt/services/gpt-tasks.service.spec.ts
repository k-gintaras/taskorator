import { TestBed } from '@angular/core/testing';

import { GptTasksService } from './gpt-tasks.service';

describe('GptTasksService', () => {
  let service: GptTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GptTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
