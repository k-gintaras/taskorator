import { TestBed } from '@angular/core/testing';

import { RandomNavigatorService } from './random-navigator.service';

describe('RandomNavigatorService', () => {
  let service: RandomNavigatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomNavigatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
