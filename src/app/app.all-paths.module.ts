import { NgModule } from '@angular/core';
import { AddMoveTaskComponent } from './components/add-move-task/add-move-task.component';
import { ArtificerComponent } from './components/artificer/artificer.component';
import { BaseComponent } from './components/base/base.component';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { ErrorComponent } from './components/error/error.component';
import { LoginComponent } from './components/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ParentComponent } from './components/parent/parent.component';
import { SearchOverlordComponent } from './components/search-overlord/search-overlord.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TaskMiniComponent } from './components/task-mini/task-mini.component';
import { TaskActionComponent } from './components/task/action/action.component';
import { ArtificerActionComponent } from './components/task/artificer-action/artificer-action.component';
import { PromoterComponent } from './components/task/promoter/promoter.component';
import { SelectedMultipleComponent } from './components/task/selected-multiple/selected-multiple.component';
import { AdminComponent } from './features/admin/admin/admin.component';
import { FavoriteTaskComponent } from './features/favorite/favorite-task/favorite-task.component';
import { FocusComponent } from './features/focus/focus/focus.component';
import { FrogTaskComponent } from './features/frog/frog-task/frog-task.component';
import { GptCreateComponent } from './features/gpt/gpt-create/gpt-create.component';
import { GptTasksComponent } from './features/gpt/gpt-tasks/gpt-tasks.component';
import { InputToTasksComponent } from './features/input-to-tasks/input-to-tasks/input-to-tasks.component';
import { RightMenuComponent } from './features/right-menu/right-menu/right-menu.component';
import { SessionComponent } from './features/session/session/session.component';
import { TaskSessionDialogComponent } from './features/session/task-session-dialog/task-session-dialog.component';
import { SimpleNavigatorComponent } from './features/task-navigator/simple-navigator/simple-navigator.component';
import { TaskNavigatorComponent } from './features/task-navigator/task-navigator/task-navigator.component';
import { TemplateHandlerComponent } from './features/template/template-handler/template-handler.component';
import { TreeViewComponent } from './features/tree-view/tree-view.component';
import { canActivate } from './services/core/auth-guard';
import { TestAppComponent } from './test-files/test-app.component';
import { AppRouteMap, CORE_APP_PATHS } from './app.core-paths.module';
import { LatestUpdatedTaskListComponent } from './features/core/sentinel/lists/latest-updated-task-list/latest-updated-task-list.component';
import { LatestCreatedTaskListComponent } from './features/core/sentinel/lists/latest-created-task-list/latest-created-task-list.component';
import { DailyTaskListComponent } from './features/core/sentinel/lists/daily-task-list/daily-task-list.component';
import { WeeklyTaskListComponent } from './features/core/sentinel/lists/weekly-task-list/weekly-task-list.component';
import { FocusTaskListComponent } from './features/core/sentinel/lists/focus-task-list/focus-task-list.component';
import { RootTaskListComponent } from './features/core/sentinel/lists/root-task-list/root-task-list.component';
import { TaskListComponent } from './features/core/sentinel/task-list/task-list.component';
import { NextTaskManagerComponent } from './features/next-task-manager/next-task-manager.component';
import { CreateRepetitiveTaskComponent } from './features/core/dreamforge/create-repetitive-task/create-repetitive-task.component';

export const ALL_APP_PATHS: AppRouteMap = {
  // SENTINEL
  // sentinel: CORE_APP_PATHS['sentinel'], // don't... double import loop import children from here
  latestUpdated: {
    path: 'latest-updated-tasks-list',
    component: LatestUpdatedTaskListComponent,
    title: 'Latest Updated Task List',
    description: '',
    icon: '',
  },
  latestCreated: {
    path: 'latest-created-tasks-list',
    component: LatestCreatedTaskListComponent,
    title: 'Latest Created Task List',
    description: '',
    icon: '',
  },
  dailyTasks: {
    path: 'daily-tasks-list',
    component: DailyTaskListComponent,
    title: 'Daily Task List',
    description: '',
    icon: '',
  },
  weeklyTasks: {
    path: 'weekly-tasks-list',
    component: WeeklyTaskListComponent,
    title: 'Weekly Task List',
    description: '',
    icon: '',
  },
  focusTasksList: {
    path: 'focus-tasks-list',
    component: FocusTaskListComponent,
    title: 'Focus Task List',
    description: '',
    icon: '',
  },
  rootTasksList: {
    path: 'root-tasks-list',
    component: RootTaskListComponent,
    title: 'Root Task List',
    description: '',
    icon: '',
  },
  // receives Task[] and title:string or else show nothing
  taskList: {
    path: 'tasks-list',
    component: TaskListComponent,
    title: 'Task Lists',
    description: '',
    icon: '',
  },

  // DREAMFORGE
  // create task full
  // create repetitive tasks
  // create templates
  // task tagger
  // dreamForge: CORE_APP_PATHS['forge'],// don't... double import loop import children from here
  createRepetitive: {
    path: 'repetitive',
    title: 'Repetitive',
    component: CreateRepetitiveTaskComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },
  focus: {
    path: 'focus',
    title: 'Focus',
    component: FocusComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },
  frog: {
    path: 'frog',
    title: 'Frog Task',
    component: FrogTaskComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },
  favorite: {
    path: 'favorite',
    title: 'Favorite Task',
    component: FavoriteTaskComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },

  // VORTEX (visual stuff)
  // statistics... completed imcompleted count... by date...
  // vortex: CORE_APP_PATHS['vortex'], // don't... double import loop import children from here

  vizualizer: {
    path: 'tree-view',
    title: 'Tree View',
    component: TreeViewComponent,
    description: '',
    icon: '',
    altName: '',
  },

  // GATEWAY first entry stuff
  // HOME
  // TUTORIAL OR INTRO
  // gateway: CORE_APP_PATHS['gateway'], // don't... double import loop import children from here

  login: {
    path: 'login',
    title: 'Login',
    component: LoginComponent,
    description: '',
    icon: '',
    altName: '',
  },
  settings: {
    path: 'settings',
    title: 'Settings',
    component: SettingsComponent,
    description: '',
    icon: '',
    altName: '',
  },

  // CRUCIBLE, do shit to groups of tasks
  // get templates, view public...
  selected: {
    path: 'selected-multiple',
    title: 'Selected Multiple',
    component: SelectedMultipleComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },
  searchOverlord: {
    path: 'search-overlord',
    title: 'Search Overlord',
    component: SearchOverlordComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },

  // NEXUS (time based stuff)
  // schedule tasks, some kind of calendar nd stuffs
  session: {
    path: 'session',
    title: 'Session',
    component: SessionComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },

  taskSessionDialog: {
    path: 'task-session-dialog',
    title: 'Task Session Dialog',
    component: TaskSessionDialogComponent,
    description: '',
    icon: '',
    altName: '',
  },

  // CITADEL other stuff to tasks (TOOLS)
  // clean missing tasks or similar tasks...
  // export
  // settings
  // score?

  // other...
  // mini components
  nextTask: {
    path: 'next-task',
    title: 'Next Task',
    component: NextTaskManagerComponent,
    description: '',
    icon: '',
    altName: '',
  },
  artificer: {
    path: 'artificer',
    title: 'Artificer',
    component: ArtificerComponent,
    description: '',
    icon: '',
    altName: '',
  },

  artificerAction: {
    path: 'artificer-action',
    title: 'Artificer Action',
    component: ArtificerActionComponent,
    description: '',
    icon: '',
    altName: '',
  },

  createTask: {
    path: 'create-task',
    title: 'Create Task',
    component: CreateTaskComponent,
    description: '',
    icon: '',
    altName: '',
  },
  error: {
    path: 'error',
    title: 'Error',
    component: ErrorComponent,
    description: '',
    icon: '',
    altName: '',
  },

  navigation: {
    path: 'navigation',
    title: 'Navigation',
    component: NavigationComponent,
    description: '',
    icon: '',
    altName: '',
  },

  promoter: {
    path: 'promoter',
    title: 'Promoter',
    component: PromoterComponent,
    description: '',
    icon: '',
    altName: '',
  },

  taskMini: {
    path: 'task-mini',
    title: 'Mini Task',
    component: TaskMiniComponent,
    description: '',
    icon: '',
    altName: '',
  },

  gptCreate: {
    path: 'gpt-create',
    title: 'GPT Create',
    component: GptCreateComponent,
    description: '',
    icon: '',
    altName: '',
  },

  gptTasks: {
    path: 'gpt-tasks',
    title: 'GPT Tasks',
    component: GptTasksComponent,
    description: '',
    icon: '',
    altName: '',
  },

  inputToTasks: {
    path: 'input-to-tasks',
    title: 'Input to Tasks',
    component: InputToTasksComponent,
    description: '',
    icon: '',
    altName: '',
  },

  simpleNavigator: {
    path: 'simple-navigator',
    title: 'Simple Navigator',
    component: SimpleNavigatorComponent,
    description: '',
    icon: '',
    altName: '',
  },
  testApp: {
    path: 'test-app',
    title: 'Test App',
    component: TestAppComponent,
    description: '',
    icon: '',
    altName: '',
  },

  // allows nice feedback and stuff
  baseComponent: {
    path: 'base',
    title: 'Base',
    component: BaseComponent,
    description: '',
    icon: 'stop',
    altName: '',
  },

  // BIG TODO: components to decide to use or not and update
  // maybe useful to toggle stuff or create task popup
  rightMenu: {
    path: 'right-menu',
    title: 'Right Menu',
    component: RightMenuComponent,
    description: '',
    icon: '',
    altName: '',
  },

  // maybe useful for settings...
  menu: {
    path: 'menu',
    title: 'Menu',
    component: MenuComponent,
    description: '',
    icon: '',
    altName: '',
  },

  // DEPRECATED
  /**
   * @deprecated components
   */
  parent: {
    path: 'parent',
    title: 'Parent',
    component: ParentComponent,
    description: '',
    icon: 'stop',
    altName: '',
  },
  navigator: {
    path: 'navigator',
    title: 'Task Navigator',
    component: TaskNavigatorComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },
  admin: {
    path: 'admin',
    title: 'Admin',
    component: AdminComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },

  template: {
    path: 'template',
    title: 'Template',
    component: TemplateHandlerComponent,
    canActivate: [canActivate],
    description: '',
    icon: '',
    altName: '',
  },
  addMoveTask: {
    path: 'add-move-task',
    title: 'Add/Move Task',
    component: AddMoveTaskComponent,
    description: '',
    icon: '',
    altName: '',
  },

  taskAction: {
    path: 'task-action',
    title: 'Task Action',
    component: TaskActionComponent,
    description: '',
    icon: '',
    altName: '',
  },
};

@NgModule({
  providers: [],
})
export class AppAllPathsModule {}
