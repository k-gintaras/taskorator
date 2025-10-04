import { TestBed } from '@angular/core/testing';
import { TaskListCoordinatorService } from './task-list-coordinator.service';
import { TaskListSimpleService } from './task-list-simple.service';
import { TaskListRulesService } from './task-list-rules.service';
import { TaskUiDecoratorService } from './task-ui-decorator.service';
import { TaskUsageService } from '../task-usage.service';
import { SettingsService } from '../../sync-api-cache/settings.service';
import { TaskListKey, TaskListType } from '../../../models/task-list-model';
import { UiTask, getDefaultUiTask } from '../../../models/taskModelManager';
import { getDefaultTaskSettings } from '../../../models/settings';

describe('TaskListCoordinatorService', () => {
  let service: TaskListCoordinatorService;
  let mockTaskListSimple: jasmine.SpyObj<TaskListSimpleService>;
  let mockTaskListRules: jasmine.SpyObj<TaskListRulesService>;
  let mockTaskDecorator: jasmine.SpyObj<TaskUiDecoratorService>;
  let mockTaskUsageService: jasmine.SpyObj<TaskUsageService>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;

  const mockUiTask: UiTask = {
    ...getDefaultUiTask(),
    taskId: '1',
    name: 'Test Task',
    priority: 5,
    isSelected: false,
    isRecentlyViewed: false,
    isRecentlyUpdated: false,
    isRecentlyCreated: false,
    completionPercent: 0,
    color: '#ffffff',
    secondaryColor: '#000000',
    views: 0,
    isConnectedToTree: false,
    children: 0,
    completedChildren: 0,
    magnitude: 5,
  };

  beforeEach(() => {
    mockTaskListSimple = jasmine.createSpyObj('TaskListSimpleService', [
      'getTaskList',
      'getTasksByIds',
    ]);
    mockTaskListRules = jasmine.createSpyObj('TaskListRulesService', [
      'applyRulesToList',
    ]);
    mockTaskDecorator = jasmine.createSpyObj('TaskUiDecoratorService', [
      'decorateTasks',
      'getSelectedTaskIds',
    ]);
    mockTaskUsageService = jasmine.createSpyObj('TaskUsageService', [
      'getMostViewedTasks',
      'getRecentlyViewedTasks',
    ]);
    mockSettingsService = jasmine.createSpyObj('SettingsService', [
      'getSettingsOnce',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TaskListCoordinatorService,
        { provide: TaskListSimpleService, useValue: mockTaskListSimple },
        { provide: TaskListRulesService, useValue: mockTaskListRules },
        { provide: TaskUiDecoratorService, useValue: mockTaskDecorator },
        { provide: TaskUsageService, useValue: mockTaskUsageService },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    });

    service = TestBed.inject(TaskListCoordinatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should handle SELECTED task list type', async () => {
      const taskListKey: TaskListKey = { type: TaskListType.SELECTED, data: 'selected' };
      const selectedIds = ['1', '2'];
      const rawTasks = [mockUiTask];
      const decoratedTasks = [mockUiTask];
      const filteredTasks = [mockUiTask];

      mockTaskDecorator.getSelectedTaskIds.and.returnValue(selectedIds);
      mockTaskListSimple.getTasksByIds.and.returnValue(Promise.resolve(rawTasks));
      mockTaskDecorator.decorateTasks.and.returnValue(decoratedTasks);
      mockTaskListRules.applyRulesToList.and.returnValue(filteredTasks);

      const result = await service.getTasks(taskListKey);

      expect(mockTaskDecorator.getSelectedTaskIds).toHaveBeenCalled();
      expect(mockTaskListSimple.getTasksByIds).toHaveBeenCalledWith(selectedIds);
      expect(mockTaskDecorator.decorateTasks).toHaveBeenCalledWith(rawTasks);
      expect(mockTaskListRules.applyRulesToList).toHaveBeenCalledWith(
        { type: TaskListType.SELECTED, data: 'selected' },
        decoratedTasks
      );
      expect(result).toEqual(filteredTasks);
    });

    it('should handle FOCUS task list type', async () => {
      const taskListKey: TaskListKey = { type: TaskListType.FOCUS, data: 'settings' };
      const settings = getDefaultTaskSettings();
      settings.focusTaskIds = ['1', '2'];
      const rawTasks = [mockUiTask];
      const decoratedTasks = [mockUiTask];
      const filteredTasks = [mockUiTask];

      mockSettingsService.getSettingsOnce.and.returnValue(Promise.resolve(settings));
      mockTaskListSimple.getTasksByIds.and.returnValue(Promise.resolve(rawTasks));
      mockTaskDecorator.decorateTasks.and.returnValue(decoratedTasks);
      mockTaskListRules.applyRulesToList.and.returnValue(filteredTasks);

      const result = await service.getTasks(taskListKey);

      expect(mockSettingsService.getSettingsOnce).toHaveBeenCalled();
      expect(mockTaskListSimple.getTasksByIds).toHaveBeenCalledWith(settings.focusTaskIds);
      expect(mockTaskDecorator.decorateTasks).toHaveBeenCalledWith(rawTasks);
      expect(mockTaskListRules.applyRulesToList).toHaveBeenCalledWith(
        { type: TaskListType.FOCUS, data: 'settings' },
        decoratedTasks
      );
      expect(result).toEqual(filteredTasks);
    });

    it('should handle MOST_VIEWED task list type', async () => {
      const taskListKey: TaskListKey = { type: TaskListType.MOST_VIEWED, data: 'mostViewed' };
      const mostViewedIds = ['1', '2'];
      const rawTasks = [mockUiTask];
      const decoratedTasks = [mockUiTask];
      const filteredTasks = [mockUiTask];

      mockTaskUsageService.getMostViewedTasks.and.returnValue(mostViewedIds);
      mockTaskListSimple.getTasksByIds.and.returnValue(Promise.resolve(rawTasks));
      mockTaskDecorator.decorateTasks.and.returnValue(decoratedTasks);
      mockTaskListRules.applyRulesToList.and.returnValue(filteredTasks);

      const result = await service.getTasks(taskListKey);

      expect(mockTaskUsageService.getMostViewedTasks).toHaveBeenCalledWith(20);
      expect(mockTaskListSimple.getTasksByIds).toHaveBeenCalledWith(mostViewedIds);
      expect(mockTaskDecorator.decorateTasks).toHaveBeenCalledWith(rawTasks);
      expect(mockTaskListRules.applyRulesToList).toHaveBeenCalledWith(
        { type: TaskListType.MOST_VIEWED, data: 'mostViewed' },
        decoratedTasks
      );
      expect(result).toEqual(filteredTasks);
    });

    it('should handle RECENTLY_VIEWED task list type', async () => {
      const taskListKey: TaskListKey = { type: TaskListType.RECENTLY_VIEWED, data: 'recentlyViewed' };
      const recentIds = ['1', '2'];
      const rawTasks = [mockUiTask];
      const decoratedTasks = [mockUiTask];
      const filteredTasks = [mockUiTask];

      mockTaskUsageService.getRecentlyViewedTasks.and.returnValue(recentIds);
      mockTaskListSimple.getTasksByIds.and.returnValue(Promise.resolve(rawTasks));
      mockTaskDecorator.decorateTasks.and.returnValue(decoratedTasks);
      mockTaskListRules.applyRulesToList.and.returnValue(filteredTasks);

      const result = await service.getTasks(taskListKey);

      expect(mockTaskUsageService.getRecentlyViewedTasks).toHaveBeenCalledWith(20);
      expect(mockTaskListSimple.getTasksByIds).toHaveBeenCalledWith(recentIds);
      expect(mockTaskDecorator.decorateTasks).toHaveBeenCalledWith(rawTasks);
      expect(mockTaskListRules.applyRulesToList).toHaveBeenCalledWith(
        { type: TaskListType.RECENTLY_VIEWED, data: 'recentlyViewed' },
        decoratedTasks
      );
      expect(result).toEqual(filteredTasks);
    });

    it('should handle other task list types via simple service', async () => {
      const taskListKey: TaskListKey = { type: TaskListType.DAILY, data: 'daily' };
      const rawTasks = [mockUiTask];
      const decoratedTasks = [mockUiTask];
      const filteredTasks = [mockUiTask];

      mockTaskListSimple.getTaskList.and.returnValue(Promise.resolve(rawTasks));
      mockTaskDecorator.decorateTasks.and.returnValue(decoratedTasks);
      mockTaskListRules.applyRulesToList.and.returnValue(filteredTasks);

      const result = await service.getTasks(taskListKey);

      expect(mockTaskListSimple.getTaskList).toHaveBeenCalledWith(taskListKey);
      expect(mockTaskDecorator.decorateTasks).toHaveBeenCalledWith(rawTasks);
      expect(mockTaskListRules.applyRulesToList).toHaveBeenCalledWith(taskListKey, decoratedTasks);
      expect(result).toEqual(filteredTasks);
    });

    it('should return empty array when simple service returns null', async () => {
      const taskListKey: TaskListKey = { type: TaskListType.DAILY, data: 'daily' };

      mockTaskListSimple.getTaskList.and.returnValue(Promise.resolve(null));

      const result = await service.getTasks(taskListKey);

      expect(result).toEqual([]);
    });
  });

  describe('getTasksByIds', () => {
    it('should return empty array for empty ids', async () => {
      const result = await service.getTasksByIds([]);
      expect(result).toEqual([]);
    });

    it('should get, decorate and apply rules to tasks by ids', async () => {
      const ids = ['1', '2'];
      const rawTasks = [mockUiTask];
      const decoratedTasks = [mockUiTask];
      const filteredTasks = [mockUiTask];

      mockTaskListSimple.getTasksByIds.and.returnValue(Promise.resolve(rawTasks));
      mockTaskDecorator.decorateTasks.and.returnValue(decoratedTasks);
      mockTaskListRules.applyRulesToList.and.returnValue(filteredTasks);

      const result = await service.getTasksByIds(ids);

      expect(mockTaskListSimple.getTasksByIds).toHaveBeenCalledWith(ids);
      expect(mockTaskDecorator.decorateTasks).toHaveBeenCalledWith(rawTasks);
      expect(mockTaskListRules.applyRulesToList).toHaveBeenCalledWith(
        { type: TaskListType.SELECTED, data: 'selected' },
        decoratedTasks
      );
      expect(result).toEqual(filteredTasks);
    });
  });

  describe('getFocusTasks', () => {
    it('should return empty array when settings are null', async () => {
      mockSettingsService.getSettingsOnce.and.returnValue(Promise.resolve(null));

      const result = await (service as any).getFocusTasks();

      expect(result).toEqual([]);
    });

    it('should return empty array when focusTaskIds is empty', async () => {
      const settings = getDefaultTaskSettings();
      settings.focusTaskIds = [];
      mockSettingsService.getSettingsOnce.and.returnValue(Promise.resolve(settings));

      const result = await (service as any).getFocusTasks();

      expect(result).toEqual([]);
    });

    it('should get, decorate and apply rules to focus tasks', async () => {
      const settings = getDefaultTaskSettings();
      settings.focusTaskIds = ['1', '2'];
      const rawTasks = [mockUiTask];
      const decoratedTasks = [mockUiTask];
      const filteredTasks = [mockUiTask];

      mockSettingsService.getSettingsOnce.and.returnValue(Promise.resolve(settings));
      mockTaskListSimple.getTasksByIds.and.returnValue(Promise.resolve(rawTasks));
      mockTaskDecorator.decorateTasks.and.returnValue(decoratedTasks);
      mockTaskListRules.applyRulesToList.and.returnValue(filteredTasks);

      const result = await (service as any).getFocusTasks();

      expect(mockSettingsService.getSettingsOnce).toHaveBeenCalled();
      expect(mockTaskListSimple.getTasksByIds).toHaveBeenCalledWith(settings.focusTaskIds);
      expect(mockTaskDecorator.decorateTasks).toHaveBeenCalledWith(rawTasks);
      expect(mockTaskListRules.applyRulesToList).toHaveBeenCalledWith(
        { type: TaskListType.FOCUS, data: 'settings' },
        decoratedTasks
      );
      expect(result).toEqual(filteredTasks);
    });
  });
});