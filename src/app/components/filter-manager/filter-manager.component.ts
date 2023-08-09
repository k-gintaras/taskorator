import { Component } from '@angular/core';
import { LocalService } from 'src/app/services/local.service';
import { TaskLoaderService } from 'src/app/services/task-loader.service';
import { Task } from 'src/app/task-model/taskModelManager';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FilterHelperService } from 'src/app/services/filter-helper.service';

@Component({
  selector: 'app-filter-manager',
  templateUrl: './filter-manager.component.html',
  styleUrls: ['./filter-manager.component.scss'],
})
export class FilterManagerComponent {
  tasks: Task[] | undefined;
  taskLists: any[] = [];
  selectedList = null;

  constructor(
    private local: LocalService,
    private taskLoaderService: TaskLoaderService,
    private filters: FilterHelperService
  ) {}
  ngOnInit() {
    this.taskLoaderService.loadTasksSlow().subscribe({
      next: () => {
        console.log('Tasks loaded and updated in local storage');
        this.local.getAllTasks().subscribe((tasks: Task[]) => {
          if (tasks) {
            this.tasks = tasks;
            this.setTaskLists();
            console.log(this.tasks.length);
          } else {
            console.error('Error fetching tasks:');
          }
        });
      },
      error: (error: any) => {
        console.error('Failed to load tasks:', error);
        // Handle the error if tasks fail to load
      },
    });
  }

  selectList(list: any) {
    this.selectedList = list;
  }

  setTaskLists() {
    this.taskLists = [
      {
        title: 'This Week:',
        tasks: this.filters.getTasksCreatedThisWeek(this.tasks),
        actionName: 'done', // popup split and qq...
        onButtonClick: (task: Task) => {
          console.log('weekly ing a task ');
        },
      },
      {
        title: 'Overlords:',
        tasks: this.filters.getOverlordTasks(this.tasks),
        actionName: 'overlord',
        onButtonClick: 'click overlord',
        onSelected: 'select overlord',
      },
      {
        title: 'Unburdened:',
        tasks: this.filters.getNonOverlordTasks(this.tasks),
        actionName: 'child',
        onButtonClick: 'click child',
        onSelected: 'select child',
      },
      {
        title: 'All Tasks:',
        tasks: this.tasks,
        actionName: 'all',
        onButtonClick: 'click all',
        onSelected: 'select all',
      },
      {
        title: 'By Priority:',
        tasks: this.filters.getHigherPriorityFiltered(this.tasks),
        actionName: 'priority',
        onButtonClick: 'click priority',
        onSelected: 'select priority',
      },
      // ...other lists...
    ];
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.taskLists, event.previousIndex, event.currentIndex);
  }
}
