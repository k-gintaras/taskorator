import { Score } from '../score';
import { TaskSettings } from '../settings';
import { TaskTree } from '../taskTree';
import { RegisterUserResult, TaskUserInfo } from './user';
import { TaskoratorTask } from '../taskModelManager';

export interface RegistrationData {
  initialTask: TaskoratorTask;
  additionalTasks: TaskoratorTask[];
  settings: TaskSettings;
  score: Score;
  tree: TaskTree;
  userInfo: TaskUserInfo;
}

export interface RegistrationApiStrategy {
  generateApiKey(): void;
  register(registrationData: RegistrationData): Promise<RegisterUserResult>;
  deleteUser(): Promise<void>; // if registration fails, we don't want this user, we have to reset all objects...
  getUserInfo(): Promise<TaskUserInfo | undefined>; // the user might not exist
  createUserInfo(userInfo: TaskUserInfo): Promise<void>;
  updateUserInfo(userInfo: TaskUserInfo): Promise<void>;
}
