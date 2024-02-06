import { TestBed } from '@angular/core/testing';

import { SqliteMigrateFirebaseService } from './sqlite-migrate-firebase.service';

describe('SqliteMigrateFirebaseService', () => {
  let service: SqliteMigrateFirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteMigrateFirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
