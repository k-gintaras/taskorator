import { TestBed } from '@angular/core/testing';

import { GptRequestService } from './gpt-request.service';

describe('GptRequestService', () => {
  let service: GptRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GptRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
