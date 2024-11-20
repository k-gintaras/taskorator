import { TestBed } from '@angular/core/testing';

import { WeeklyListService } from './weekly-list.service';

describe('WeeklyListService', () => {
  let service: WeeklyListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeeklyListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
