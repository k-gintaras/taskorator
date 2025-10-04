import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiFirebaseService } from '../../services/core/api-firebase.service';
import { ApiOfflineService } from '../../services/core/api-offline.service';
import {
  AuthOfflineService,
  OfflineUser,
} from '../../services/core/auth-offline.service';
import { AuthService } from '../../services/core/auth.service';
import { SessionManagerService } from '../../services/session-manager.service';
import { TreeService } from '../../services/sync-api-cache/tree.service';
import { TaskService } from '../../services/sync-api-cache/task.service';
import { User } from 'firebase/auth';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthUser } from '../../models/service-strategies/auth-strategy.interface';
import { API_STRATEGY, AUTH_STRATEGY } from '../../tokens';
import { ModeService } from '../../services/mode.service';
import { ConfigService } from '../../services/config.service';
import { TaskListService } from '../../services/sync-api-cache/task-list.service';
import { TaskBatchService } from '../../services/sync-api-cache/task-batch.service';
import { SettingsService } from '../../services/sync-api-cache/settings.service';
import { ScoreService } from '../../services/sync-api-cache/score.service';
import { RegistrationService } from '../../services/core/registration.service';
import { TestDataInitializerService } from '../test-services/test-data-initializer.service';
import { TaskInitializerService } from '../../services/core/task-initializer.service';

describe('SessionManagerService', () => {
  let sessionManager: SessionManagerService;

  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAuthOfflineService: jasmine.SpyObj<AuthOfflineService>;
  let mockApiFirebaseService: jasmine.SpyObj<ApiFirebaseService>;
  let mockApiOfflineService: jasmine.SpyObj<ApiOfflineService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockTreeService: jasmine.SpyObj<TreeService>;
  let mockModeService: jasmine.SpyObj<ModeService>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;
  let mockTaskListService: jasmine.SpyObj<TaskListService>;
  let mockTaskBatchService: jasmine.SpyObj<TaskBatchService>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;
  let mockScoreService: jasmine.SpyObj<ScoreService>;
  let mockRegistrationService: jasmine.SpyObj<RegistrationService>;
  let mockTestDataInitializerService: jasmine.SpyObj<TestDataInitializerService>;
  let mockTaskInitializerService: jasmine.SpyObj<TaskInitializerService>;
  let mockAuthStrategy: any;
  let mockApiStrategy: any;

  const mockUser: AuthUser = {
    uid: 'test-user',
    email: 'test@example.com',
    displayName: 'Test User',
    isAnonymous: false,
    emailVerified: true,
  };

  const mockOfflineUser: AuthUser = {
    uid: 'offline-user',
    displayName: 'Offline User',
    email: null,
    isAnonymous: true,
    emailVerified: false,
  };

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'initialize', // ← add this
      'isAuthenticated',
      'getCurrentUser',
    ]);
    mockAuthService.initialize.and.returnValue(undefined);

    mockAuthOfflineService = jasmine.createSpyObj('AuthOfflineService', [
      'initialize', // ← add this
      'login',
      'getCurrentUser',
      'isAuthenticated',
    ]);
    mockAuthOfflineService.initialize.and.returnValue(undefined);

    mockAuthOfflineService.getCurrentUser.and.returnValue(of(mockOfflineUser));
    mockAuthOfflineService.isAuthenticated.and.returnValue(true);
    const fakeLoginResult = { userId: mockOfflineUser.uid, isNewUser: true };

    mockAuthOfflineService.login.and.returnValue(
      Promise.resolve(fakeLoginResult)
    ); // at both lines 57 & 120
    mockAuthOfflineService.isAuthenticated.and.returnValue(true);
    mockAuthOfflineService.getCurrentUser.and.returnValue(of(mockOfflineUser));

    mockApiFirebaseService = jasmine.createSpyObj('ApiFirebaseService', [
      'generateApiKey',
      'register',
    ]);

    mockApiOfflineService = jasmine.createSpyObj('ApiOfflineService', [
      'generateApiKey',
    ]);

    mockTaskService = jasmine.createSpyObj('TaskService', ['initialize']);
    mockTreeService = jasmine.createSpyObj('TreeService', ['initialize']);

    mockModeService = jasmine.createSpyObj('ModeService', ['get']);
    mockConfigService = jasmine.createSpyObj('ConfigService', [], {
      testDataMode: false
    });
    mockTaskListService = jasmine.createSpyObj('TaskListService', ['initialize']);
    mockTaskBatchService = jasmine.createSpyObj('TaskBatchService', ['initialize']);
    mockSettingsService = jasmine.createSpyObj('SettingsService', ['initialize', 'fetchSettings']);
    mockScoreService = jasmine.createSpyObj('ScoreService', ['initialize']);
    mockRegistrationService = jasmine.createSpyObj('RegistrationService', ['initialize', 'registerNewUser']);
    mockTestDataInitializerService = jasmine.createSpyObj('TestDataInitializerService', ['initializeTestData']);
    mockTaskInitializerService = jasmine.createSpyObj('TaskInitializerService', ['registerOfflineUser']);

    // Create strategy mocks that delegate to the appropriate service
    mockAuthStrategy = jasmine.createSpyObj('AuthStrategy', [
      'isAuthenticated', 'getCurrentUser', 'login', 'getCurrentUserId', 'logOut', 'deleteCurrentUser',
      'loginWithEmailAndPassword', 'loginWithGoogle', 'loginWithYahoo', 'loginWithFacebook',
      'sendSignInLinkToEmail', 'confirmSignInWithEmail'
    ]);
    mockApiStrategy = jasmine.createSpyObj('ApiStrategy', [
      'generateApiKey', 'register'
    ]);

    // Default configuration for online mode
    mockAuthStrategy.isAuthenticated.and.returnValue(true);
    mockAuthStrategy.getCurrentUser.and.returnValue(of(mockUser));
    mockApiStrategy.generateApiKey.and.returnValue('test-key');
    mockApiStrategy.register.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        SessionManagerService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthOfflineService, useValue: mockAuthOfflineService },
        { provide: ApiFirebaseService, useValue: mockApiFirebaseService },
        { provide: ApiOfflineService, useValue: mockApiOfflineService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: TreeService, useValue: mockTreeService },
        { provide: ModeService, useValue: mockModeService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TaskListService, useValue: mockTaskListService },
        { provide: TaskBatchService, useValue: mockTaskBatchService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ScoreService, useValue: mockScoreService },
        { provide: RegistrationService, useValue: mockRegistrationService },
        { provide: TestDataInitializerService, useValue: mockTestDataInitializerService },
        { provide: TaskInitializerService, useValue: mockTaskInitializerService },
        { provide: AUTH_STRATEGY, useValue: mockAuthStrategy },
        { provide: API_STRATEGY, useValue: mockApiStrategy },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
      ],
    });

    sessionManager = TestBed.inject(SessionManagerService);
  });

  afterEach(() => {
    mockAuthService.isAuthenticated.calls.reset();
    mockAuthService.getCurrentUser.calls.reset();
    mockAuthOfflineService.isAuthenticated.calls.reset();
    mockAuthOfflineService.getCurrentUser.calls.reset();
    mockAuthStrategy.isAuthenticated.calls.reset();
    mockAuthStrategy.getCurrentUser.calls.reset();
    mockAuthStrategy.login.calls.reset();
    // mockTaskService.initialize.calls.reset();
    // mockTreeService.initialize.calls.reset();
  });

  it('should initialize correctly in online mode', async () => {
    mockModeService.get.and.returnValue('online');
    mockAuthService.getCurrentUser.and.returnValue(of(mockUser as User));
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockSettingsService.fetchSettings.and.returnValue(Promise.resolve());

    // Configure strategy mocks to delegate to online services
    mockAuthStrategy.isAuthenticated.and.returnValue(true);
    mockAuthStrategy.getCurrentUser.and.returnValue(of(mockUser as User));

    await sessionManager.initialize('online');

    expect(mockAuthStrategy.isAuthenticated).toHaveBeenCalled();
    expect(mockAuthStrategy.getCurrentUser).toHaveBeenCalled();
    expect(sessionManager.getSessionType()).toBe('online');
  });

  it('should initialize correctly in offline mode', async () => {
    mockModeService.get.and.returnValue('offline');

    // Reconfigure strategy mocks for offline mode
    const fakeLoginResult = { userId: mockOfflineUser.uid, isNewUser: true };
    mockAuthStrategy.login.and.returnValue(Promise.resolve(fakeLoginResult));
    mockAuthStrategy.isAuthenticated.and.returnValue(true);
    mockAuthStrategy.getCurrentUser.and.returnValue(of(mockOfflineUser));

    // Initialize session
    await sessionManager.initialize('offline');

    // Verify calls
    expect(mockAuthStrategy.login).toHaveBeenCalled();
    expect(mockAuthStrategy.getCurrentUser).toHaveBeenCalled();
    expect(sessionManager.getSessionType()).toBe('offline');
  });
});
