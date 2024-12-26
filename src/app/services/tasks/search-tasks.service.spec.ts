import { TestBed } from '@angular/core/testing';

import { SearchTasksService } from './search-tasks.service';

describe('SearchTasksService', () => {
  let service: SearchTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
