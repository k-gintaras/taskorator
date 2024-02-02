import { Component } from '@angular/core';
import { FirebaseDatabaseService } from 'src/app/services/firebase-database.service';
import { Task } from 'src/app/task-model/taskModelManager';

@Component({
  selector: 'app-test-firebase',
  templateUrl: './test-firebase.component.html',
  styleUrls: ['./test-firebase.component.css'],
})
export class TestFirebaseComponent {
  constructor(private fb: FirebaseDatabaseService) {}

  testSaveTask() {
    const t: Task = {
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
    this.fb.createTask(t);
  }
}
