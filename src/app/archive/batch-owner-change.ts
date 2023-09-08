import { Task } from '../task-model/taskModelManager';

export class BatchOwnerChange {
  defaultParent: null | string;
  tasks: Task[];
  delay: number;
  updateTimeout: any;
  constructor(tasks: Task[], defaultParent: string, delay: number) {
    // Your initialization code
    this.defaultParent = defaultParent;
    this.tasks = tasks;
    this.updateTimeout = null;
    this.delay = delay; // Time in milliseconds (adjust as needed)
  }

  // Method to update the owner of tasks after a debounce
  updateOwnerAfterDebounce() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.tasks.forEach((task) => {
        task.owner = this.defaultParent ? this.defaultParent : '';
      });
    }, this.delay);
  }

  // Method to update the defaultParent and trigger the debounced update
  updateDefaultParent(newDefaultParent: string) {
    this.defaultParent = newDefaultParent;
    this.updateOwnerAfterDebounce();
  }
}
