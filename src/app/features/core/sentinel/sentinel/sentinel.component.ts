import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  NavigationEnd,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { Task, getBaseTask } from '../../../../models/taskModelManager';
import { TaskListService } from '../../../../services/task/task-list/task-list.service';
import { TaskNavigatorUltraService } from '../../../task-navigator/services/task-navigator-ultra.service';
import { SelectedOverlordService } from '../../../../services/task/selected-overlord.service';
import { ALL_APP_PATHS } from '../../../../app.all-paths.module';
import { CreateTaskComponent } from '../../../../components/create-task/create-task.component';
import { SimpleNavigatorComponent } from '../../../task-navigator/simple-navigator/simple-navigator.component';

@Component({
  selector: 'app-sentinel',
  standalone: true,
  templateUrl: './sentinel.component.html',
  styleUrls: ['./sentinel.component.scss'],
  imports: [CreateTaskComponent, SimpleNavigatorComponent, RouterOutlet],
})
export class SentinelComponent {}
//  implements OnInit {
// tasks: Task[] | null = null;
// errorMessage: string | null = null;
// title = '';
// selectedOverlord: Task | undefined;

// constructor(
//   private router: Router,
//   private route: ActivatedRoute,
//   private taskListService: TaskListService,
//   private navigatorService: TaskNavigatorUltraService,
//   private selectedOverlordService: SelectedOverlordService
// ) {}

// async ngOnInit() {
//   this.loadTitle();

//   // Subscribe to route data to capture route changes, including initial navigation
//   this.route.data.subscribe(() => this.loadTasksFromRoute());

//   // Subscribe to router events to detect explicit navigations to child routes
//   this.router.events
//     .pipe(filter((event) => event instanceof NavigationEnd))
//     .subscribe(() => this.loadTasksFromRoute());

//   // Set up selected overlord subscription
//   this.selectedOverlordService
//     .getSelectedOverlordObservable()
//     .subscribe((t: Task | null) => {
//       if (t) {
//         this.selectedOverlord = t;
//       }
//     });

//   // Initial load of tasks based on current route
//   this.loadTasksFromRoute();
// }

// // Dynamically load tasks based on the current route
// async loadTasksFromRoute() {
//   const routePath =
//     this.route.firstChild?.snapshot?.routeConfig?.path ||
//     this.router.url.split('/').pop();

//   console.log('Detected route path:', routePath);
//   if (!routePath) return;

//   // Match routePath to the predefined routes in ALL_APP_PATHS
//   switch (routePath) {
//     case ALL_APP_PATHS['latestUpdated'].path:
//       await this.loadLatestUpdatedTasks();
//       break;
//     case ALL_APP_PATHS['latestCreated'].path:
//       await this.loadLatestTasks();
//       break;
//     case ALL_APP_PATHS['dailyTasks'].path:
//       await this.loadDailyTasks();
//       break;
//     case ALL_APP_PATHS['weeklyTasks'].path:
//       await this.loadWeeklyTasks();
//       break;
//     case ALL_APP_PATHS['focusTasksList'].path:
//       await this.loadFocusTasks();
//       break;
//     case ALL_APP_PATHS['rootTasksList'].path:
//       await this.loadOverlordTasks();
//       break;
//     default:
//       this.errorMessage = 'Invalid route, unable to load tasks';
//       break;
//   }
// }

// // Task loading methods (existing logic)
// async loadLatestTasks() {
//   await this.loadTasks(this.taskListService.getLatestTasks());
//   this.setOverlordAndTitle(ALL_APP_PATHS['latestCreated'].title);
// }

// async loadLatestUpdatedTasks() {
//   await this.loadTasks(this.taskListService.getLatestUpdatedTasks());
//   this.setOverlordAndTitle(ALL_APP_PATHS['latestUpdated'].title);
// }

// async loadDailyTasks() {
//   await this.loadTasks(this.taskListService.getDailyTasks());
//   this.setOverlordAndTitle(ALL_APP_PATHS['dailyTasks'].title);
// }

// async loadWeeklyTasks() {
//   await this.loadTasks(this.taskListService.getWeeklyTasks());
//   this.setOverlordAndTitle(ALL_APP_PATHS['weeklyTasks'].title);
// }

// async loadFocusTasks() {
//   await this.loadTasks(this.taskListService.getFocusTasks());
//   this.setOverlordAndTitle(ALL_APP_PATHS['focusTasksList'].title);
// }

// async loadOverlordTasks() {
//   await this.loadTasks(this.taskListService.getOverlordTasks('128'));
//   this.setOverlordAndTitle(ALL_APP_PATHS['rootTasksList'].title);
// }

// // Helper method to load tasks and handle errors
// private async loadTasks(taskLoader: Promise<Task[] | null>) {
//   try {
//     this.tasks = await taskLoader;
//     this.errorMessage = null;
//   } catch (error) {
//     this.tasks = null;
//     this.errorMessage = 'Failed to load tasks.';
//     console.error(error);
//   }
// }

// // Helper method to set the base task and update the title
// private setOverlordAndTitle(title: string) {
//   if (!this.tasks) return;
//   const overlord = getBaseTask();
//   overlord.name = 'Root';
//   this.setSelectedTitle(title);

//   this.navigatorService.setInitialTasks(overlord, this.tasks);
//   this.navigatorService.setTaskNavigationView(overlord, this.tasks);
// }

// // Set the selected title
// setSelectedTitle(s: string) {
//   this.taskListService.setSelectedTitle(s);
// }

// // Load title from the observable
// loadTitle() {
//   this.taskListService
//     .getSelectedTitleObservable()
//     .subscribe((t: string | null) => {
//       if (t) this.title = t;
//     });
// }
// }
