import { TestBed } from '@angular/core/testing';

import { RightMenuService } from './right-menu.service';

describe('RightMenuService', () => {
  let service: RightMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RightMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
