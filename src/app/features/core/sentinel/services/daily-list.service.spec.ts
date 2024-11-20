import { TestBed } from '@angular/core/testing';

import { DailyListService } from './daily-list.service';

describe('DailyListService', () => {
  let service: DailyListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
