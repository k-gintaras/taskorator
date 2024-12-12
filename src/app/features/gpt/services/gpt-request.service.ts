import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { SENSITIVE_CONFIG } from '../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class GptRequestService {
  private apiUrl = SENSITIVE_CONFIG.gptServiceUrl;

  constructor(private http: HttpClient) {}

  // makeGptRequest(userInput: string, userId: string): Observable<any> {
  //   const requestData = { userInput };
  //   const headers = { 'user-id': userId };

  //   return this.http.post<any>(`${this.apiUrl}/gpt-request`, requestData, {
  //     headers,
  //   });
  // }

  async makeGptRequest(userInput: string, userId: string): Promise<any> {
    const requestData = { userInput };
    const headers = { 'user-id': userId };

    // Use firstValueFrom to convert Observable to Promise
    return firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/gpt-request`, requestData, {
        headers,
      })
    );
  }
}
