import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GptRequestService {
  private apiUrl = 'https://gpt-web-service.onrender.com'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  makeGptRequest(userInput: string, userId: string): Observable<any> {
    const requestData = { userInput };
    const headers = { 'user-id': userId };

    return this.http.post<any>(`${this.apiUrl}/gpt-request`, requestData, {
      headers,
    });
  }
}
