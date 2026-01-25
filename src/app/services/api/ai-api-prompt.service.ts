import { Injectable } from '@angular/core';
import { AiApiFirebaseService } from '../core/ai-api-firebase.service';

// Models for Prompt endpoint
export interface PromptRequest {
  extraInstruction?: string;
  prompt: string;
  id: string; // Assistant ID
}

export interface PromptResponse {
  answer: string;
}

// Models for Conversation endpoint
export interface ConversationRequest {
  assistantId: string;
  userId?: string | null;
  chatId?: string | null;
  sessionId?: string | null;
  prompt: string;
}

export interface ConversationResponse {
  assistantId: string;
  userId?: string;
  chatId: string;
  sessionId: string;
  responseType: string;
  answer: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiApiPromptService {
  private apiBaseUrl = 'http://192.168.4.41:3001';

  constructor(private aiApiFirebase: AiApiFirebaseService) {}

  /**
   * Call the /prompt endpoint to get a single prompt response
   */
  async callPrompt(request: PromptRequest): Promise<PromptResponse> {
    const token = await this.aiApiFirebase.getIdToken();
    if (!token) {
      throw new Error('No token available. Please login to AI-API first.');
    }

    const response = await fetch(`${this.apiBaseUrl}/prompt`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Prompt API failed with status ${response.status}: ${errorData.error || response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Call the /conversation endpoint to get a conversation response
   */
  async callConversation(request: ConversationRequest): Promise<ConversationResponse> {
    const token = await this.aiApiFirebase.getIdToken();
    if (!token) {
      throw new Error('No token available. Please login to AI-API first.');
    }

    // Build request body with all fields (including null values for TSOA validation)
    const body = {
      assistantId: request.assistantId,
      userId: request.userId || null,
      chatId: request.chatId || null,
      sessionId: request.sessionId || null,
      prompt: request.prompt,
    };

    console.log('Conversation request body:', body);

    const response = await fetch(`${this.apiBaseUrl}/conversation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorText = await response.text().catch(() => '');
      console.error('Conversation API error response:', errorText);
      throw new Error(
        `Conversation API failed with status ${response.status}: ${errorData.error || response.statusText}`
      );
    }

    return response.json();
  }
}
