import { Injectable } from '@angular/core';
import { UserCredential } from 'firebase/auth';

/**
 * registration additional service
 * @example
 * const r = inject(RegistrationService);
 * r.registerUser(user: UserCredential);
 *
 * @remarks
 * sets up all the data associated with user when registering
 */
@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  registerUser(user: UserCredential) {
    throw new Error('Method not implemented.');
    // create settings
    // create score
    // create tree
    // create core task
  }
}
