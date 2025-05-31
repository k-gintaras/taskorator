import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class KeyApiService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }
    return userId;
  }

  /**
   * beware this will only be used by our separate API not angular
   * API server should check if "key" allowed... not just if key exists...
   */
  async generateApiKey(): Promise<void> {
    try {
      // Generate a unique API key (you can use any method to generate a key)
      const userId = this.getUserId();

      const apiKey = this.generateUniqueApiKey();

      // Store the API key in a separate collection "apiKeys" indexed by user ID
      const apiKeyDocRef = doc(this.firestore, 'apiKeys', userId);
      await setDoc(apiKeyDocRef, { apiKey });
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  }

  private generateUniqueApiKey(): string {
    // Implement your logic to generate a unique API key here
    // Example: Generate a random alphanumeric string
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const apiKeyLength = 32; // Adjust the length as needed
    let apiKey = '';
    for (let i = 0; i < apiKeyLength; i++) {
      apiKey += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return apiKey;
  }
}
