import { Component, OnInit } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FirebaseDatabaseService } from 'src/app/services/firebase-database.service';
import { SqliteMigrateFirebaseService } from 'src/app/services/sqlite-migrate-firebase.service';
import { Task } from 'src/app/models/taskModelManager';

@Component({
  selector: 'app-test-firebase',
  templateUrl: './test-firebase.component.html',
  styleUrls: ['./test-firebase.component.css'],
})
export class TestFirebaseComponent implements OnInit {
  t: Task = {
    taskId: '',
    name: 'lalala1',
    todo: '',
    why: '',
    timeCreated: null,
    lastUpdated: null,
    timeEnd: null,
    duration: 0,
    overlord: null,
    repeat: 'once',
    status: 'active',
    stage: 'seen',
    type: '',
    subtype: '',
    size: 'do now',
    owner: '',
    priority: 0,
    backupLink: '',
    imageUrl: null,
    imageDataUrl: null,
    tags: [],
  };

  // tasks: Observable<Task[]>;

  filtered: Task[] = [];
  tasksArray: Task[] = [];
  tasksSqlite: Task[] = [];
  missingTasks: Task[] = [];

  constructor(
    private fb: FirebaseDatabaseService,
    private migrationService: SqliteMigrateFirebaseService,
    private sqliteApi: ApiService
  ) {
    // this.tasks = fb.fetchTasks();
  }

  ngOnInit(): void {
    // Optionally, trigger migration from here or from a dedicated method
    // this.tasks = this.fb.fetchTasks();
    // this.sqliteApi
    //   .fetchTasks()
    //   .subscribe((tasks) => (this.tasksSqlite = tasks));
    this.compareTasks();
  }

  async compareTasks() {
    // this.tasks = this.fb.fetchTasks();
    // this.fb.fetchTasks().subscribe((tasks) => {
    //   this.tasksArray = tasks;
    //   this.filtered = tasks;
    // });
    // this.sqliteApi.fetchTasks().subscribe((tasks) => {
    //   this.tasksSqlite = tasks;
    //   // this.finalizeComparison();
    // });
  }

  // async finalizeComparison() {
  //   // Convert Firebase tasks Observable to a promise
  //   const tasksFirebase: Task[] = await lastValueFrom(this.tasks);

  //   // Assuming Task has a unique 'taskId' property to compare
  //   const firebaseTaskIds = new Set(tasksFirebase.map((task) => task.taskId));

  //   this.missingTasks = this.tasksSqlite.filter(
  //     (task) => !firebaseTaskIds.has(task.taskId)
  //   );

  //   // Now 'missingTasks' holds tasks that are in SQLite but not in Firebase
  //   console.log('Missing Tasks:', this.missingTasks);
  // }

  testSaveTask() {
    // this.fb.createTask(this.t);
    console.log('testing task adding works nice');
  }
  // upload all tasks
  // fix all tasks to their ids...
  async migrateTasks() {
    try {
      // Fetch tasks from SQLite and convert the Observable to a Promise
      this.tasksSqlite = await lastValueFrom(this.sqliteApi.fetchTasks());
      console.log('Migrating');

      // Proceed with migration if tasks were fetched successfully
      if (this.tasksSqlite.length > 0) {
        console.log('Creating');

        const idMap = await this.migrationService.createTasks(this.tasksSqlite);
        console.log('Updating');

        await this.migrationService.updateOverlordReferences(idMap);
        console.log('Migration completed');
      } else {
        console.log('No tasks to migrate.');
      }
    } catch (error) {
      console.error(
        'Failed to fetch tasks from SQLite or migration failed:',
        error
      );
    }
  }
}
