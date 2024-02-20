import { Injectable } from '@angular/core';
import { ApiStrategy } from './interfaces/api-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiService implements ApiStrategy {
  getTasks(): Promise<string | null> {
    throw new Error('Method not implemented.');
  }
}
