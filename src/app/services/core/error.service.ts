import { Injectable } from '@angular/core';
import { ErrorHandlingStrategy } from './interfaces/error-handling-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandlingStrategy {
  ERROR_NOT_LOGGED_IN = 'Login first please.';
  ERROR_NOT_VALID_TASK = 'Problem with task. Maybe wrong parent or bad name.';
  handleError(error: any): void {
    // throw new Error('Method not implemented.');
    console.log(error);
  }

  log(error: any): void {
    // throw new Error('Method not implemented.');
    console.log(error);
  }

  feedback(error: any): void {
    // throw new Error('Method not implemented.');
    console.log(error);
  }
}
