import { TestBed } from '@angular/core/testing';

import { CurrentInputService } from './current-input.service';

describe('CurrentInputService', () => {
  let service: CurrentInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
