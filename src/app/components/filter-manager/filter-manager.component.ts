import { Component } from '@angular/core';
import { LocalService } from 'src/app/services/local.service';
import { TaskLoaderService } from 'src/app/services/task-loader.service';
import { Task } from 'src/app/task-model/taskModelManager';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FilterHelperService } from 'src/app/services/filter-helper.service';
import { SelectedTaskService } from 'src/app/services/selected-task.service';
import { ListService } from 'src/app/services/list.service';
import { TaskList } from 'src/app/task-model/taskListModel';
import { TaskService } from 'src/app/services/task.service';
import { FeedbackService } from 'src/app/services/feedback.service';

@Component({
  selector: 'app-filter-manager',
  templateUrl: './filter-manager.component.html',
  styleUrls: ['./filter-manager.component.scss'],
})
// FIXME: it is probably not used anymore but has lots of good ideas
export class FilterManagerComponent {
  tasks: Task[] | undefined;
  taskLists: any[] = [];
  selectedList = null;
  selectedTask: Task | null = null;

  constructor(
    private local: LocalService,
    private taskLoaderService: TaskLoaderService,
    private filters: FilterHelperService,
    private selected: SelectedTaskService,
    private listService: ListService,
    private taskService: TaskService,
    private feedbackService: FeedbackService
  ) {}
  ngOnInit() {
    this.selected.getSelectedTaskSubscription().subscribe({
      next: (t) => {
        this.selectedTask = t;
        console.log(this.selectedTask?.name);
        // need to force update the list too
        // this.taskLists[1] = this.listService.getSubtasks(
        //   this.tasks,
        //   this.selectedTask
        // );
      },
    });

    this.taskLoaderService.loadTasksSlow().subscribe({
      next: () => {
        console.log('Tasks loaded and updated in local storage');
        this.local.getAllTasks().subscribe((tasks: Task[]) => {
          if (tasks) {
            this.tasks = tasks;
            this.selectedTask = this.tasks[0];
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
    const blankList = {
      title: 'Collector',
      tasks: [],
      actionName: 'clear',
      onButtonClick: (task: Task) => {
        console.log('remove: ' + task.name);
        // Find the index of the task to be removed
        const taskIndex = blankList.tasks.findIndex(
          (t: Task) => t.taskId === task.taskId
        );

        // If task exists in the list, remove it
        if (taskIndex !== -1) {
          console.log('found');
          blankList.tasks.splice(taskIndex, 1);
        }
      },
      onSelected: (task: Task) => {
        console.log('onSelected: ' + task.name);
      },
    };

    // blankList.onButtonClick = (task: Task) => {
    //   console.log('onButtonClick: ' + task.name);
    // };
    const allTasks = this.listService.getAll(this.tasks);
    if (allTasks) {
      allTasks.actionName = 'To Collector';
      allTasks.onButtonClick = (task: Task) => {
        this.addToList(blankList.tasks, task);
      };
    }

    // this is not really weekly because we need to keep improving this, so maybe... "next"
    const weekly = this.listService.getWeekly(this.tasks);

    if (weekly) {
      weekly.onButtonClick = (task: Task) => {
        this.feedback('Completed: ' + task.name);
        this.taskService.complete(task);
      };
    }

    this.taskLists = [
      weekly,
      this.listService.getOverlordBrowser(this.tasks),
      this.listService.getSubtasks(this.tasks, this.selectedTask),
      blankList,
      this.listService.getWithSubtasks(this.tasks),
      this.listService.getDaily(this.tasks),

      this.listService.getWithNoSubtasks(this.tasks),
      this.listService.getToArchive(this.tasks),
      allTasks,
    ];
  }

  addToList(list: Task[], task: Task) {
    list.push(task);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.taskLists, event.previousIndex, event.currentIndex);
  }

  feedback(msg: string) {
    this.feedbackService.sendFeedback(msg, false);
  }
}
