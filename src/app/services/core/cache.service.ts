import { Injectable } from '@angular/core';
import { CacheStrategy } from './interfaces/cache-strategy.interface';

@Injectable({
  providedIn: 'root',
})
export class CacheService implements CacheStrategy {
  get(key: string) {
    throw new Error('Method not implemented.');
  }
  set(key: string, value: any): void {
    throw new Error('Method not implemented.');
  }
}
