import { TestBed } from '@angular/core/testing';

import { NavigationBuilderService } from './navigation-builder.service';

describe('NavigationBuilderService', () => {
  let service: NavigationBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
