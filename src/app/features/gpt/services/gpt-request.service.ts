import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SENSITIVE_CONFIG } from '../../../app.config';
import { AuthService } from '../../../services/core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GptRequestService {
  private apiUrl = SENSITIVE_CONFIG.gptServiceUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  async makeGptRequest(userInput: string): Promise<any> {
    const userId = this.getUserId();
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
