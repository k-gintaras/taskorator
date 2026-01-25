import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { AiApiFirebaseService } from '../../../services/core/ai-api-firebase.service';
import { GeneralApiService } from '../../../services/api/general-api.service';
import { ErrorService } from '../../../services/core/error.service';
import { AiApiPromptService } from '../../../services/api/ai-api-prompt.service';

@Component({
  selector: 'app-ai-api-auth-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './ai-api-auth-test.component.html',
  styleUrls: ['./ai-api-auth-test.component.scss'],
})
export class AiApiAuthTestComponent implements OnInit {
  aiApiUid: string | null = null;
  aiApiToken: string | null = null;
  healthCheckResult: string | null = null;
  claimsResult: string | null = null;
  setClaimsResult: string | null = null;
  isLoading = false;
  error: string | null = null;

  // Claims form
  claimsCanUseGpt = false;
  claimsRole = 'user';
  decodedTokenResult: string | null = null;

  // Prompt form
  promptText = '';
  promptExtraInstruction = '';
  promptAssistantId = '097ab4e4-4f39-4a98-95d2-9362531d3511';
  promptResult: string | null = null;

  // Conversation form
  conversationPrompt = '';
  conversationAssistantId = '097ab4e4-4f39-4a98-95d2-9362531d3511';
  conversationChatId = '';
  conversationSessionId = '';
  conversationResult: string | null = null;

  constructor(
    private aiApiFirebase: AiApiFirebaseService,
    private apiService: GeneralApiService,
    private errorService: ErrorService,
    private aiApiPromptService: AiApiPromptService
  ) {}

  ngOnInit(): void {
    this.updateUid();
  }

  async loginToAiApi(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      await this.aiApiFirebase.loginGoogle();
      this.updateUid();
      this.errorService.feedback('Logged into AI-API successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      this.error = message;
      this.errorService.error(`AI-API Login failed: ${message}`);
    } finally {
      this.isLoading = false;
    }
  }

  async logoutFromAiApi(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      await this.aiApiFirebase.logout();
      this.aiApiUid = null;
      this.aiApiToken = null;
      this.errorService.feedback('Logged out from AI-API');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      this.error = message;
      this.errorService.error(`AI-API Logout failed: ${message}`);
    } finally {
      this.isLoading = false;
    }
  }

  async printAiApiUid(): Promise<void> {
    this.error = null;
    try {
      this.aiApiUid = this.aiApiFirebase.getUid();
      if (this.aiApiUid) {
        console.log('AI-API UID:', this.aiApiUid);
        this.errorService.feedback(`UID: ${this.aiApiUid}`);
      } else {
        this.error = 'No user logged in to AI-API';
        this.errorService.error('No user logged in to AI-API');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get UID';
      this.error = message;
      this.errorService.error(message);
    }
  }

  async copyAiApiTokenToClipboard(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      const token = await this.aiApiFirebase.getIdToken();
      if (token) {
        this.aiApiToken = token;
        await navigator.clipboard.writeText(token);
        this.errorService.feedback('Token copied to clipboard');
      } else {
        this.error = 'No token available. User may not be logged in.';
        this.errorService.error('No token available');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to copy token';
      this.error = message;
      this.errorService.error(message);
    } finally {
      this.isLoading = false;
    }
  }

  async callHealthApi(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.healthCheckResult = null;
    try {
      const token = await this.aiApiFirebase.getIdToken();
      if (!token) {
        this.error = 'No token available. Please login to AI-API first.';
        this.errorService.error('No token available');
        return;
      }

      // Call the health endpoint with Bearer token
      const response = await fetch('http://192.168.4.41:3001/admin/health', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      this.healthCheckResult = JSON.stringify(data, null, 2);

      if (response.ok) {
        this.errorService.feedback(`Health check passed: ${data.uid || 'OK'}`);
      } else {
        this.error = `Health check failed with status ${response.status}`;
        this.errorService.error(this.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Health check failed';
      this.error = message;
      this.errorService.error(`Health check error: ${message}`);
    } finally {
      this.isLoading = false;
    }
  }

  private updateUid(): void {
    this.aiApiUid = this.aiApiFirebase.getUid();
  }

  async showAiApiTokenClaims(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.claimsResult = null;
    try {
      const token = await this.aiApiFirebase.getIdToken();
      if (!token) {
        this.error = 'No token available. Please login to AI-API first.';
        this.errorService.error('No token available');
        return;
      }

      // Debug: Log token info and headers
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 50) + '...');
      const authHeader = `Bearer ${token}`;
      console.log('Authorization header length:', authHeader.length);
      console.log('Authorization header (first 60 chars):', authHeader.substring(0, 60) + '...');

      // Call the whoami endpoint to get token claims
      const response = await fetch('http://192.168.4.41:3001/admin/whoami', {
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      this.claimsResult = JSON.stringify(data, null, 2);

      if (response.ok) {
        this.errorService.feedback('Token claims retrieved');
        console.log('Token claims:', data);
      } else {
        this.error = `Failed to get claims: ${data.error || response.statusText}`;
        this.errorService.error(this.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch claims';
      this.error = message;
      this.errorService.error(`Error fetching claims: ${message}`);
    } finally {
      this.isLoading = false;
    }
  }

  async refreshAiApiToken(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      const token = await this.aiApiFirebase.getIdToken(true); // Force refresh
      if (token) {
        this.aiApiToken = token;
        this.errorService.feedback('Token refreshed successfully');
        console.log('Token refreshed');
      } else {
        this.error = 'Failed to refresh token';
        this.errorService.error('Failed to refresh token');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh token';
      this.error = message;
      this.errorService.error(`Error refreshing token: ${message}`);
    } finally {
      this.isLoading = false;
    }
  }

  async decodeTokenLocally(): Promise<void> {
    this.error = null;
    this.decodedTokenResult = null;
    try {
      const token = await this.aiApiFirebase.getIdToken();
      if (!token) {
        this.error = 'No token available. Please login to AI-API first.';
        this.errorService.error('No token available');
        return;
      }

      // Decode locally without server call
      const decoded = jwtDecode<any>(token);
      this.decodedTokenResult = JSON.stringify(decoded, null, 2);
      this.errorService.feedback('Token decoded locally');
      console.log('Decoded token (local):', decoded);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decode token';
      this.error = message;
      this.errorService.error(`Error decoding token: ${message}`);
    }
  }

  async setAiApiClaims(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.setClaimsResult = null;
    try {
      const uid = this.aiApiFirebase.getUid();
      if (!uid) {
        this.error = 'No user logged in to AI-API. Please login first.';
        this.errorService.error('No user logged in');
        return;
      }

      const token = await this.aiApiFirebase.getIdToken();
      if (!token) {
        this.error = 'No token available';
        this.errorService.error('No token available');
        return;
      }

      // Validate form
      if (!this.claimsRole || this.claimsRole.trim() === '') {
        this.error = 'Role is required. Please select a role.';
        this.errorService.error(this.error);
        return;
      }

      console.log('Setting claims with:', {
        canUseGpt: this.claimsCanUseGpt,
        role: this.claimsRole,
      });

      // Call the set-claims endpoint with uid in the URL
      const response = await fetch(`http://192.168.4.41:3001/admin/users/${uid}/claims`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canUseGpt: this.claimsCanUseGpt,
          role: this.claimsRole,
        }),
      });

      const data = await response.json();
      this.setClaimsResult = JSON.stringify(data, null, 2);

      if (response.ok) {
        this.errorService.feedback('Claims set successfully');
        console.log('Claims set:', data);
      } else {
        this.error = `Failed to set claims: ${data.error || response.statusText}`;
        this.errorService.error(this.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set claims';
      this.error = message;
      this.errorService.error(`Error setting claims: ${message}`);
    } finally {
      this.isLoading = false;
    }
  }

  async callPromptApi(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.promptResult = null;
    try {
      // Validate form
      if (!this.promptText || this.promptText.trim() === '') {
        this.error = 'Prompt text is required';
        this.errorService.error(this.error);
        return;
      }

      if (!this.promptAssistantId || this.promptAssistantId.trim() === '') {
        this.error = 'Assistant ID is required';
        this.errorService.error(this.error);
        return;
      }

      console.log('Calling prompt API with:', {
        prompt: this.promptText,
        extraInstruction: this.promptExtraInstruction || undefined,
        id: this.promptAssistantId,
      });

      const response = await this.aiApiPromptService.callPrompt({
        prompt: this.promptText,
        extraInstruction: this.promptExtraInstruction || undefined,
        id: this.promptAssistantId,
      });

      this.promptResult = JSON.stringify(response, null, 2);
      this.errorService.feedback('Prompt API call successful');
      console.log('Prompt response:', response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to call prompt API';
      this.error = message;
      this.errorService.error(`Error: ${message}`);
      console.error('Prompt API error:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async callConversationApi(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.conversationResult = null;
    try {
      // Validate form
      if (!this.conversationPrompt || this.conversationPrompt.trim() === '') {
        this.error = 'Conversation prompt is required';
        this.errorService.error(this.error);
        return;
      }

      if (!this.conversationAssistantId || this.conversationAssistantId.trim() === '') {
        this.error = 'Assistant ID is required';
        this.errorService.error(this.error);
        return;
      }

      console.log('Calling conversation API with:', {
        assistantId: this.conversationAssistantId,
        chatId: this.conversationChatId || null,
        sessionId: this.conversationSessionId || null,
        prompt: this.conversationPrompt,
      });

      const response = await this.aiApiPromptService.callConversation({
        assistantId: this.conversationAssistantId,
        chatId: this.conversationChatId || null,
        sessionId: this.conversationSessionId || null,
        prompt: this.conversationPrompt,
      });

      this.conversationResult = JSON.stringify(response, null, 2);
      this.errorService.feedback('Conversation API call successful');
      console.log('Conversation response:', response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to call conversation API';
      this.error = message;
      this.errorService.error(`Error: ${message}`);
      console.error('Conversation API error:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
