import { TestBed } from '@angular/core/testing';

import { TextTypeDetectorService } from './text-type-detector.service';

describe('TextTypeDetectorService', () => {
  let service: TextTypeDetectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextTypeDetectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
