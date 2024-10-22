import { AddMoveTaskComponent } from '../components/add-move-task/add-move-task.component';
import { ArtificerComponent } from '../components/artificer/artificer.component';
import { BaseComponent } from '../components/base/base.component';
import { CreateTaskComponent } from '../components/create-task/create-task.component';
import { ErrorComponent } from '../components/error/error.component';
import { LoginComponent } from '../components/login/login.component';
import { MenuComponent } from '../components/menu/menu.component';
import { NavigationComponent } from '../components/navigation/navigation.component';
import { ParentComponent } from '../components/parent/parent.component';
import { SearchOverlordComponent } from '../components/search-overlord/search-overlord.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { TaskMiniComponent } from '../components/task-mini/task-mini.component';
import { TaskActionComponent } from '../components/task/action/action.component';
import { ArtificerActionComponent } from '../components/task/artificer-action/artificer-action.component';
import { PromoterComponent } from '../components/task/promoter/promoter.component';
import { SelectedMultipleComponent } from '../components/task/selected-multiple/selected-multiple.component';
import { AdminComponent } from '../features/admin/admin/admin.component';
import { DreamforgeComponent } from '../features/core/dreamforge/dreamforge/dreamforge.component';
import { SentinelComponent } from '../features/core/sentinel/sentinel/sentinel.component';
import { FavoriteTaskComponent } from '../features/favorite/favorite-task/favorite-task.component';
import { FocusComponent } from '../features/focus/focus/focus.component';
import { FrogTaskComponent } from '../features/frog/frog-task/frog-task.component';
import { GptCreateComponent } from '../features/gpt/gpt-create/gpt-create.component';
import { GptTasksComponent } from '../features/gpt/gpt-tasks/gpt-tasks.component';
import { InputToTasksComponent } from '../features/input-to-tasks/input-to-tasks/input-to-tasks.component';
import { RightMenuComponent } from '../features/right-menu/right-menu/right-menu.component';
import { SessionComponent } from '../features/session/session/session.component';
import { TaskSessionDialogComponent } from '../features/session/task-session-dialog/task-session-dialog.component';
import { SimpleNavigatorComponent } from '../features/task-navigator/simple-navigator/simple-navigator.component';
import { TaskNavigatorComponent } from '../features/task-navigator/task-navigator/task-navigator.component';
import { TemplateHandlerComponent } from '../features/template/template-handler/template-handler.component';
import { TreeViewComponent } from '../features/tree-view/tree-view.component';
import { TestAppComponent } from '../test-files/test-app.component';

const components = [
  'add-move-task',
  'artificer',
  'base',
  'create-task',
  'error',
  'login',
  'menu',
  'navigation',
  'parent',
  'search-overlord',
  'settings',
  'task-action',
  'artificer-action',
  'promoter',
  'selected-multiple',
  'task-mini',
  'admin',
  'dreamforge',
  'favorite-task',
  'focus',
  'frog-task',
  'gpt-create',
  'gpt-tasks',
  'input-to-tasks',
  'right-menu',
  'sentinel',
  'session',
  'task-session-dialog',
  'simple-navigator',
  'task-navigator',
  'template-handler',
  'tree-view',
  'test-app',
];

const allRoutes = [
  { path: 'add-move-task', component: AddMoveTaskComponent },
  { path: 'artificer', component: ArtificerComponent },
  { path: 'base', component: BaseComponent },
  { path: 'create-task', component: CreateTaskComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'login', component: LoginComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'navigation', component: NavigationComponent },
  { path: 'parent', component: ParentComponent },
  { path: 'search-overlord', component: SearchOverlordComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'task-action', component: TaskActionComponent },
  { path: 'artificer-action', component: ArtificerActionComponent },
  { path: 'promoter', component: PromoterComponent },
  { path: 'selected-multiple', component: SelectedMultipleComponent },
  { path: 'task-mini', component: TaskMiniComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'dreamforge', component: DreamforgeComponent },
  { path: 'favorite-task', component: FavoriteTaskComponent },
  { path: 'focus', component: FocusComponent },
  { path: 'frog-task', component: FrogTaskComponent },
  { path: 'gpt-create', component: GptCreateComponent },
  { path: 'gpt-tasks', component: GptTasksComponent },
  { path: 'input-to-tasks', component: InputToTasksComponent },
  { path: 'right-menu', component: RightMenuComponent },
  { path: 'sentinel', component: SentinelComponent },
  { path: 'session', component: SessionComponent },
  { path: 'task-session-dialog', component: TaskSessionDialogComponent },
  { path: 'simple-navigator', component: SimpleNavigatorComponent },
  { path: 'task-navigator', component: TaskNavigatorComponent },
  { path: 'template-handler', component: TemplateHandlerComponent },
  { path: 'tree-view', component: TreeViewComponent },
  { path: 'test-app', component: TestAppComponent },
];
