import { TestBed } from '@angular/core/testing';

import { ServiceInitiatorService } from './service-initiator.service';

describe('ServiceInitiatorService', () => {
  let service: ServiceInitiatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceInitiatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
