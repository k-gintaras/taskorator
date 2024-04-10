import { TestBed } from '@angular/core/testing';

import { PreviousService } from './previous.service';

describe('PreviousService', () => {
  let service: PreviousService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviousService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
