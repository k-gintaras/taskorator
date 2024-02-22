import { Injectable } from '@angular/core';
import { ErrorHandlingStrategy } from './interfaces/error-handling-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandlingStrategy {
  ERROR_NOT_LOGGED_IN = 'Login first please.';
  handleError(error: any): void {
    throw new Error('Method not implemented.');
  }
}
