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

describe('SessionManagerService', () => {
  let sessionManager: SessionManagerService;

  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAuthOfflineService: jasmine.SpyObj<AuthOfflineService>;
  let mockApiFirebaseService: jasmine.SpyObj<ApiFirebaseService>;
  let mockApiOfflineService: jasmine.SpyObj<ApiOfflineService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockTreeService: jasmine.SpyObj<TreeService>;

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
      'isAuthenticated',
      'getCurrentUser',
    ]);

    mockAuthOfflineService = jasmine.createSpyObj('AuthOfflineService', [
      'login',
      'getCurrentUser',
      'isAuthenticated',
    ]);

    mockAuthOfflineService.getCurrentUser.and.returnValue(of(mockOfflineUser));
    mockAuthOfflineService.isAuthenticated.and.returnValue(true);
    mockAuthOfflineService.login.and.returnValue(Promise.resolve()); // Mock login
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

    TestBed.configureTestingModule({
      providers: [
        SessionManagerService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthOfflineService, useValue: mockAuthOfflineService },
        { provide: ApiFirebaseService, useValue: mockApiFirebaseService },
        { provide: ApiOfflineService, useValue: mockApiOfflineService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: TreeService, useValue: mockTreeService },
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
    // mockTaskService.initialize.calls.reset();
    // mockTreeService.initialize.calls.reset();
  });

  it('should initialize correctly in online mode', async () => {
    mockAuthService.getCurrentUser.and.returnValue(of(mockUser as User));
    mockAuthService.isAuthenticated.and.returnValue(true);

    await sessionManager.initialize('online');

    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    // expect(mockTaskService.initialize).toHaveBeenCalledWith(
    //   mockApiFirebaseService
    // );
    // expect(mockTreeService.initialize).toHaveBeenCalledWith(
    //   mockApiFirebaseService
    // );
    expect(sessionManager.getSessionType()).toBe('online');
  });

  it('should initialize correctly in offline mode', async () => {
    // Configure mocks
    mockAuthOfflineService.login.and.returnValue(Promise.resolve()); // Mock successful login
    mockAuthOfflineService.isAuthenticated.and.returnValue(true);
    mockAuthOfflineService.getCurrentUser.and.returnValue(of(mockOfflineUser));

    // Initialize session
    await sessionManager.initialize('offline');

    // Verify calls
    expect(mockAuthOfflineService.login).toHaveBeenCalled();
    expect(mockAuthOfflineService.isAuthenticated).toHaveBeenCalled();
    expect(mockAuthOfflineService.getCurrentUser).toHaveBeenCalled();

    expect(sessionManager.getSessionType()).toBe('offline');
  });
});
