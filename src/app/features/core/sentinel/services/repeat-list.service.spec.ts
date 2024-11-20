import { TestBed } from '@angular/core/testing';

import { RepeatListService } from './repeat-list.service';

describe('RepeatListService', () => {
  let service: RepeatListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepeatListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
