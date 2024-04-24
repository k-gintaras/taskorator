import { TestBed } from '@angular/core/testing';

import { LocalSqliteService } from './local-sqlite.service';

describe('LocalSqliteService', () => {
  let service: LocalSqliteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalSqliteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
