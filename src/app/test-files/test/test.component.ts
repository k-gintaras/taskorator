import { Component, OnInit } from '@angular/core';
import { SimpleNavigatorComponent } from '../../features/task-navigator/simple-navigator/simple-navigator.component';
import { ArtificerComponent } from '../../components/artificer/artificer.component';
import {
  getBaseTask,
  getDefaultTask,
  Task,
} from '../../models/taskModelManager';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [SimpleNavigatorComponent, ArtificerComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TestComponent implements OnInit {
  tasks: Task[] = [];

  ngOnInit(): void {
    for (let i = 0; i < 10; i++) {
      const t: Task = { ...getDefaultTask() };
      t.name = 'Test Task: ' + Math.random() * 1000;
      this.tasks.push(t);
    }
  }
}
