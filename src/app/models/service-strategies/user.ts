export interface RegisterUserResult {
  success: boolean;
  message: string;
  userId?: string;
}

export interface TaskUserInfo {
  allowedTemplates: string[];
  canCreate: boolean;
  canUseGpt: boolean;
  role: string;
  registered: boolean;
}
