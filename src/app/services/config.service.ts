import { Injectable } from '@angular/core';
import { OTHER_CONFIG } from '../app.config';

/**
 * Wraps static config values in a service for easy injection and testing
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  /** Enables offline mode (no Firebase calls) */
  get offlineTesting(): boolean {
    return OTHER_CONFIG.OFFLINE_TESTING;
  }

  /** Enables auto-seeding of test data in offline mode */
  get testDataMode(): boolean {
    return OTHER_CONFIG.TEST_DATA_MODE;
  }

  /** Selected test data profile */
  get testUserProfile(): string {
    return OTHER_CONFIG.TEST_USER_PROFILE;
  }
}
