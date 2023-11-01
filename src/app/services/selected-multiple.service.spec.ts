import { TestBed } from '@angular/core/testing';

import { SelectedMultipleService } from './selected-multiple.service';

describe('SelectedMultipleService', () => {
  let service: SelectedMultipleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedMultipleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
