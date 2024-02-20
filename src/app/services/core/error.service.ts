import { Injectable } from '@angular/core';
import { ErrorHandlingStrategy } from './interfaces/error-handling-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandlingStrategy {
  handleError(error: any): void {
    throw new Error('Method not implemented.');
  }
}
