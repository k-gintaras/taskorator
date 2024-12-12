import { TestBed } from '@angular/core/testing';

import { FavoriteTaskService } from './favorite-task.service';

describe('FavoriteTaskService', () => {
  let service: FavoriteTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoriteTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
