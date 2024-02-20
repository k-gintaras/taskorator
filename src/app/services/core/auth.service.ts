import { Injectable } from '@angular/core';
import { AuthStrategy } from './interfaces/auth-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthStrategy {
  getCurrentUserId(): Promise<string | null> {
    throw new Error('Method not implemented.');
  }
  logOut(): Promise<string | null> {
    throw new Error('Method not implemented.');
  }
}
