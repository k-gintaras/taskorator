import { TestBed } from '@angular/core/testing';

import { GptSuggestService } from './gpt-suggest.service';

describe('GptSuggestService', () => {
  let service: GptSuggestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GptSuggestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
