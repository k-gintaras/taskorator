// taskorator-main.component.ts
import { NgFor } from '@angular/common';
import { Component, signal } from '@angular/core';
import { HorizontalNavigationComponent } from '../../../components/horizontal-navigation/horizontal-navigation.component';

interface Task {
  id: number;
  title: string;
  children?: Task[];
}

@Component({
  selector: 'app-taskorator-main',
  standalone: true,
  imports: [NgFor, HorizontalNavigationComponent],
  templateUrl: './taskorator-main.component.html',
  styleUrls: ['./taskorator-main.component.scss'], // keeps Tailwind utilities + any overrides
})
export class TaskoratorMainComponent {
  navModes = ['⟳ Refresh', '✎ Edit', '✔ Done', '🗑 Delete'];
  currentMode = signal(this.navModes[0]);

  parent: Task = { id: 0, title: 'Root objective' };
  tasks: Task[] = [
    { id: 1, title: 'Scaffold feature' },
    { id: 2, title: 'Write tests', children: [{ id: 3, title: 'Edge cases' }] },
  ];

  setMode(mode: string) {
    this.currentMode.set(mode);
  }
  actOn(task: Task) {
    /* dispatch mode-specific action */
  }
}
