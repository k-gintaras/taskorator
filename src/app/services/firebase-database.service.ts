import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  docData,
  limit,
  orderBy,
} from '@angular/fire/firestore';
import { Task } from '../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class FirebaseDatabaseService {
  private tasksCache = new Map<string, Task[]>();

  constructor(private firestore: Firestore) {}

  // Method to get tasks by overlordId
  getOverlordChildren(overlordId: string): Observable<Task[]> {
    // Check if we already have the tasks for this overlordId in the cache
    const cachedTasks = this.tasksCache.get(overlordId);
    if (cachedTasks) {
      // If tasks are cached, return them as an Observable
      return of(cachedTasks);
    } else {
      // If not cached, fetch from Firestore
      const queryConstraint = query(
        collection(this.firestore, 'tasks'),
        where('overlord', '==', overlordId)
      );
      return (
        collectionData(queryConstraint, { idField: 'taskId' }) as Observable<
          Task[]
        >
      ).pipe(
        tap((tasks) => {
          this.tasksCache.set(overlordId, tasks);
        })
      );
    }
  }

  getSuperOverlord(overlordId: string): Observable<Task | undefined> {
    const overlordDocRef = doc(this.firestore, `tasks/${overlordId}`);

    return (
      docData(overlordDocRef, { idField: 'taskId' }) as Observable<
        Task | undefined
      >
    ).pipe(
      switchMap((overlord: Task | undefined) => {
        if (!overlord || !overlord.overlord) {
          return of(undefined); // Return undefined if there's no super overlord
        }
        // Fetch the overlord of the current overlord
        const superOverlordDocRef = doc(
          this.firestore,
          `tasks/${overlord.overlord}`
        );
        return docData(superOverlordDocRef, {
          idField: 'taskId',
        }) as Observable<Task | undefined>;
      }),
      tap((task: Task | undefined) => {
        // if we store it, then it will not get its super overlord tasks, it will just get this task...
        if (task && task.overlord) {
          this.cacheSuperOverlord(task.overlord, task);
        }
      }),
      catchError((error) => {
        console.error('Failed to fetch super overlord', error);
        return of(undefined);
      })
    );
  }

  private findSuperOverlordInCache(overlordId: string): Task | undefined {
    for (const tasks of this.tasksCache.values()) {
      const superOverlord = tasks.find((task) => task.taskId === overlordId);
      if (superOverlord) return superOverlord;
    }
    return undefined;
  }

  private cacheSuperOverlord(overlordId: string, task: Task): void {
    const tasks = this.tasksCache.get(overlordId) || [];
    const existingIndex = tasks.findIndex((t) => t.taskId === task.taskId);
    if (existingIndex > -1) {
      tasks[existingIndex] = task; // Update existing task in cache
    } else {
      tasks.push(task); // Add new task to cache
    }
    this.tasksCache.set(overlordId, tasks);
  }

  getFirstTaskId(): Observable<string> {
    // Assuming the logic to determine if the cache can suggest a "first task" isn't straightforward
    // and we primarily rely on Firestore for this purpose

    // Firestore query to fetch the first task based on your criteria, e.g., `createdAt`
    const queryRef = query(
      collection(this.firestore, 'tasks'),
      orderBy('createdAt'),
      limit(1)
    );
    return collectionData(queryRef, { idField: 'taskId' }).pipe(
      map((tasks) => {
        if (tasks.length > 0) {
          const firstTask: Task = tasks[0] as Task; // Cast since we're expecting Task structure
          // Optionally cache the fetched task if not already in cache
          this.updateTaskCache(firstTask); // Assuming an updated cache method signature
          return firstTask.taskId;
        } else {
          throw new Error('No tasks found');
        }
      })
    );
  }

  getTaskById(taskId: string): Observable<Task | undefined> {
    // Attempt to find the task in the cache first
    const cachedTask = this.findTaskInCache(taskId);
    if (cachedTask) {
      // If task is found in cache, return it as an Observable
      return of(cachedTask);
    } else {
      // If task is not in cache, fetch it from Firestore
      const docRef = doc(this.firestore, `tasks/${taskId}`);
      return (docData(docRef, { idField: 'taskId' }) as Observable<Task>).pipe(
        tap((task) => {
          // don't do it, because it will not fetch children, it will think this task is this parent children
          // Optionally cache the fetched task
          // this.updateTaskCache(task);
        })
      );
    }
  }

  private findTaskInCache(taskId: string): Task | undefined {
    // Iterate through the cache to find the task by ID
    for (const [overlordId, tasks] of this.tasksCache.entries()) {
      const foundTask = tasks.find((task) => task.taskId === taskId);
      if (foundTask) return foundTask;
    }
    return undefined; // Return undefined if task is not found in cache
  }

  private updateTaskCache(task: Task): void {
    // Add or update the task in the appropriate cache
    if (task.overlord === null) return;
    const tasks = this.tasksCache.get(task.overlord) || [];
    const existingTaskIndex = tasks.findIndex((t) => t.taskId === task.taskId);
    if (existingTaskIndex > -1) {
      tasks[existingTaskIndex] = task; // Update existing task
    } else {
      tasks.push(task); // Add new task
    }
    this.tasksCache.set(task.overlord, tasks);
  }

  // private getAllData() {
  //   const itemCollection = collection(this.firestore, 'tasks');

  //   this.tasks$ = collectionData(itemCollection, {
  //     idField: 'taskId',
  //   }) as Observable<Task[]>;

  //   console.log('fetched tasks');
  // }

  // fetchTasks(): Observable<Task[]> | undefined {
  //   return this.tasks$;
  // }

  // private tasksCache = new Map<string, Task[]>();

  async updateTask(task: Task): Promise<void> {
    if (!task.overlord) {
      throw new Error('updateTask Missing task overlord');
    }
    if (!task.taskId) {
      throw new Error('updateTask Missing task ID');
    }
    const taskDocRef = doc(this.firestore, `tasks/${task.taskId}`);
    await updateDoc(taskDocRef, { ...task });

    // Update cache
    const tasks = this.tasksCache.get(task.overlord) || [];
    const taskIndex = tasks.findIndex((t) => t.taskId === task.taskId);
    if (taskIndex > -1) {
      tasks[taskIndex] = task;
      this.tasksCache.set(task.overlord, tasks);
    }
  }

  async createTask(task: Task): Promise<Task> {
    if (!task.overlord) {
      throw new Error('createTask Missing task overlord');
    }
    const taskCollectionRef = collection(this.firestore, 'tasks');
    const docRef = await addDoc(taskCollectionRef, task);
    const newTask = { ...task, taskId: docRef.id };

    // Add to cache
    const tasks = this.tasksCache.get(task.overlord) || [];
    tasks.push(newTask);
    this.tasksCache.set(task.overlord, tasks);

    return newTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    await deleteDoc(taskDocRef);

    // Remove from cache
    this.tasksCache.forEach((tasks, overlordId) => {
      const taskIndex = tasks.findIndex((t) => t.taskId === taskId);
      if (taskIndex > -1) {
        tasks.splice(taskIndex, 1);
        this.tasksCache.set(overlordId, tasks);
      }
    });
  }
  // Gracefully handle task updates, allowing the mission to proceed despite minor anomalies.
  async updateTasks(tasks: Task[]): Promise<void> {
    const batch = writeBatch(this.firestore);

    tasks.forEach((task) => {
      // Validate task properties without halting the entire operation
      if (!task.overlord || !task.taskId) {
        console.log(
          `updateTasks Error: Missing ${
            !task.overlord ? 'task overlord' : 'task ID'
          } for task ${task.taskId || 'unknown'}`
        );
        return; // Skip this task and move on to the next
      }

      const taskDocRef = doc(this.firestore, `tasks/${task.taskId}`);
      batch.update(taskDocRef, { ...task });

      const cachedTasks = this.tasksCache.get(task.overlord) || [];
      const taskIndex = cachedTasks.findIndex((t) => t.taskId === task.taskId);
      if (taskIndex > -1) {
        cachedTasks[taskIndex] = task; // Update existing task in cache
      } else {
        cachedTasks.push(task); // Add new task to cache
      }
      this.tasksCache.set(task.overlord, cachedTasks);
    });

    try {
      await batch.commit(); // Attempt to commit the batch operation
    } catch (error) {
      console.error('Failed to commit batch update:', error); // Log any errors encountered during the commit
    }
  }

  // Skillfully navigate the task creation process, ensuring all tasks find their place in the cosmos, despite the occasional anomaly.
  async createTasks(tasks: Task[]): Promise<void> {
    const batch = writeBatch(this.firestore);

    tasks.forEach((task) => {
      // Ensure every task has an overlord before proceeding
      if (!task.overlord) {
        console.log('createTasks Error: Missing task overlord for a task');
        return; // Skip this task, continuing our journey through the rest
      }

      const taskCollectionRef = collection(this.firestore, 'tasks');
      const taskDocRef = doc(taskCollectionRef); // Prepare a new document reference
      batch.set(taskDocRef, task); // Add the task to the batch

      // Update cache, charting a course with the new task included
      const cachedTasks = this.tasksCache.get(task.overlord) || [];
      const newTask = { ...task, taskId: taskDocRef.id }; // Mark the task with its new ID
      cachedTasks.push(newTask); // Add the newly discovered task to the cache
      this.tasksCache.set(task.overlord, cachedTasks);
    });

    try {
      await batch.commit(); // Attempt to commit the batch, hoping for smooth sailing
    } catch (error) {
      console.error('Failed to commit batch creation:', error); // Log any turbulence encountered during the operation
    }
  }
}
