import { Injectable } from '@angular/core';
import { LogStrategy } from './interfaces/log-strategy.interface copy';

@Injectable({
  providedIn: 'root',
})
export class LogService implements LogStrategy {
  log(error: any): void {
    throw new Error('Method not implemented.');
  }
}
