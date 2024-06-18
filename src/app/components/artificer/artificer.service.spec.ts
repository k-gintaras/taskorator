import { TestBed } from '@angular/core/testing';

import { ArtificerService } from './artificer.service';

describe('ArtificerService', () => {
  let service: ArtificerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtificerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
