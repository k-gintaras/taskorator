import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class KeyApiService {
  constructor(private firestore: Firestore) {}

  async generateApiKey(userId: string): Promise<string | undefined> {
    try {
      // Generate a unique API key (you can use any method to generate a key)
      const apiKey = this.generateUniqueApiKey();

      // Store the API key in a separate collection "apiKeys" indexed by user ID
      const apiKeyDocRef = doc(this.firestore, 'apiKeys', userId);
      await setDoc(apiKeyDocRef, { apiKey });

      return apiKey;
    } catch (error) {
      console.error('Error generating API key:', error);
      return undefined;
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
