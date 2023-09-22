import { TestBed } from '@angular/core/testing';

import { SelectedOverlordService } from './selected-overlord.service';

describe('SelectedOverlordService', () => {
  let service: SelectedOverlordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedOverlordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
