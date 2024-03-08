import { Injectable } from '@angular/core';
import { ApiStrategy } from './interfaces/api-strategy.interface';
import { Observable, catchError, from, map, of, switchMap, tap } from 'rxjs';
import { Score } from 'src/app/models/score';
import { Settings } from 'src/app/models/settings';
import { Task } from 'src/app/models/taskModelManager';
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
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { TaskTree } from 'src/app/models/taskTree';

/**
 * @todo
 * rewrite this later into separate firebase, so i can just get any doc, any doc by id, any doc ... for other apps
 */
@Injectable({
  providedIn: 'root',
})
export default class ApiService implements ApiStrategy {
  constructor(private firestore: Firestore) {}

  // async createTask(userId: string, task: Task): Promise<Task> {
  //   if (!userId || !task.overlord) {
  //     throw new Error(
  //       !userId ? 'User not authenticated' : 'Missing task overlord'
  //     );
  //   }

  //   const userTasksCollectionRef = collection(
  //     this.firestore,
  //     `users/${userId}/tasks`
  //   );
  //   const docRef = await addDoc(userTasksCollectionRef, task);
  //   const newTask = { ...task, taskId: docRef.id };
  //   return newTask;
  // }

  async createTask(userId: string, task: Task): Promise<Task> {
    const userTaskCollectionRef = collection(
      this.firestore,
      `users/${userId}/tasks`
    );
    const taskDocRef = doc(userTaskCollectionRef); // Prepare a new document reference within user's tasks collection
    const newTask = { ...task, taskId: taskDocRef.id }; // Add taskId to the task

    try {
      await setDoc(taskDocRef, newTask); // Directly set the new task document with the generated ID
      return newTask; // Return the newly created task with its ID
    } catch (error) {
      console.error('Failed to create task:', error);
      throw new Error('Task creation failed'); // Rethrow or handle as appropriate
    }
  }

  async updateTask(userId: string, task: Task): Promise<void> {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    if (!task.taskId) {
      throw new Error('Missing task ID for update');
    }
    if (!task.overlord) {
      throw new Error('Missing task overlord');
    }
    const taskDocRef = doc(
      this.firestore,
      `users/${userId}/tasks`,
      task.taskId
    );
    await updateDoc(taskDocRef, { ...task });
  }

  getTaskById(userId: string, taskId: string): Observable<Task | undefined> {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    if (!taskId) {
      throw new Error('Missing task ID for update');
    }
    const docRef = doc(this.firestore, `users/${userId}/tasks/${taskId}`);
    return docData(docRef, { idField: 'taskId' }) as Observable<Task>;
  }

  getLatestTaskId(userId: string): Observable<string | undefined> {
    const tasksRef = query(
      collection(this.firestore, `users/${userId}/tasks`),
      orderBy('timeCreated', 'desc'),
      limit(1)
    );
    return collectionData(tasksRef, { idField: 'taskId' }).pipe(
      map((tasks) => tasks[0]?.taskId),
      catchError(() => of(undefined))
    );
  }

  getSuperOverlord(
    userId: string,
    overlordId: string
  ): Observable<Task | undefined> {
    const overlordDocRef = doc(
      this.firestore,
      `users/${userId}/tasks/${overlordId}`
    );
    return (
      docData(overlordDocRef, { idField: 'taskId' }) as Observable<
        Task | undefined
      >
    ).pipe(
      switchMap((overlord: Task | undefined) => {
        if (!overlord || !overlord.overlord) {
          return of(undefined);
        }
        const superOverlordDocRef = doc(
          this.firestore,
          `users/${userId}/tasks/${overlord.overlord}`
        );
        return docData(superOverlordDocRef, {
          idField: 'taskId',
        }) as Observable<Task | undefined>;
      })
    );
  }

  getOverlordChildren(
    userId: string,
    overlordId: string
  ): Observable<Task[] | undefined> {
    // If not cached, fetch from Firestore
    const queryConstraint = query(
      collection(this.firestore, 'tasks'),
      where('overlord', '==', overlordId)
    );
    return collectionData(queryConstraint, { idField: 'taskId' }) as Observable<
      Task[]
    >;
  }

  /**
   * @todo
   * beware of getting all tasks it is expensive, for now it is not allowed
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTasks(userId: string): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }

  async createTasks(userId: string, tasks: Task[]): Promise<Task[]> {
    const batch = writeBatch(this.firestore);
    const newTasks: Task[] = [];

    tasks.forEach((task) => {
      if (!task.overlord) {
        console.log('createTasks Error: Missing task overlord for a task');
        return;
      }

      const userTaskCollectionRef = collection(
        this.firestore,
        `users/${userId}/tasks`
      );
      const taskDocRef = doc(userTaskCollectionRef); // Prepare a new document reference within user's tasks collection
      const newTask = { ...task, taskId: taskDocRef.id }; // Add taskId to each task
      batch.set(taskDocRef, newTask); // Add the task with its new taskId to the batch
      newTasks.push(newTask); // Collect the new task with its taskId for return
    });

    try {
      await batch.commit(); // Commit the batch
      return newTasks; // Return the array of tasks with their new taskIds after successful batch commit
    } catch (error) {
      console.error('Failed to commit batch creation:', error);
      throw new Error('Batch creation failed'); // Rethrow or handle as appropriate
    }
  }

  async updateTasks(userId: string, tasks: Task[]): Promise<void> {
    const batch = writeBatch(this.firestore);

    tasks.forEach((task) => {
      if (!task.overlord || !task.taskId) {
        console.log(
          `updateTasks Error: Missing ${
            !task.overlord ? 'task overlord' : 'task ID'
          } for task ${task.taskId || 'unknown'}`
        );
        return;
      }

      const taskDocRef = doc(
        this.firestore,
        `users/${userId}/tasks/${task.taskId}`
      );
      batch.update(taskDocRef, { ...task });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error('Failed to commit batch update:', error);
      throw error; // Consider rethrowing to allow for external error handling.
    }
  }

  // async updateTree(userId: string, taskTree: TaskTree): Promise<void> {
  //   const treeDocRef = doc(this.firestore, `users/${userId}/tree`);
  //   try {
  //     const taskTreeData = JSON.parse(JSON.stringify(taskTree));
  //     await updateDoc(treeDocRef, taskTreeData);
  //   } catch (error) {
  //     console.error('Failed to update tree:', error);
  //     throw error;
  //   }
  // }

  // async createTree(
  //   userId: string,
  //   taskTree: TaskTree
  // ): Promise<TaskTree | null> {
  //   const treeDocRef = doc(this.firestore, `users/${userId}/tree`);
  //   try {
  //     const taskTreeData = JSON.parse(JSON.stringify(taskTree)); // Convert TaskTree to a plain object
  //     await setDoc(treeDocRef, taskTreeData);
  //     return taskTree; // Assuming taskTree does not need the Firestore-generated ID
  //   } catch (error) {
  //     console.error('Failed to create tree:', error);
  //     return null;
  //   }
  // }

  // async getTree(userId: string): Promise<TaskTree | null> {
  //   const treeDocRef = doc(this.firestore, `users/${userId}/tree`);
  //   try {
  //     const docSnap = await getDoc(treeDocRef);
  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       return JSON.parse(JSON.stringify(data)); // Assuming direct conversion is sufficient
  //     } else {
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('Failed to get tree:', error);
  //     return null;
  //   }
  // }

  async createTree(
    userId: string,
    taskTree: TaskTree
  ): Promise<TaskTree | null> {
    const treeDocRef = doc(
      this.firestore,
      `users/${userId}/taskTrees/${userId}`
    );
    try {
      await setDoc(treeDocRef, taskTree);
      return taskTree;
    } catch (error) {
      console.error('Failed to create tree:', error);
      throw new Error('Task tree creation failed');
    }
  }

  async updateTree(userId: string, taskTree: TaskTree): Promise<void> {
    const treeDocRef = doc(this.firestore, `users/${userId}/trees/${userId}`); // firebase store stuff inside stuff with keys, so it has to be inside a unique key
    try {
      const taskTreeData = JSON.parse(JSON.stringify(taskTree));
      await setDoc(treeDocRef, taskTreeData, { merge: true });
    } catch (error) {
      console.error('Failed to update tree:', error);
      throw error;
    }
  }

  async getTree(userId: string): Promise<TaskTree | null> {
    const treeDocRef = doc(
      this.firestore,
      `users/${userId}/taskTrees/${userId}`
    );
    try {
      const docSnap = await getDoc(treeDocRef);
      if (docSnap.exists()) {
        return docSnap.data() as TaskTree;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get tree:', error);
      return null;
    }
  }

  // async createSettings(
  //   userId: string,
  //   settings: Settings
  // ): Promise<Settings | null> {
  //   const settingsDocRef = doc(this.firestore, `users/${userId}/settings`);
  //   try {
  //     const settingsData = JSON.parse(JSON.stringify(settings)); // Convert Settings to a plain object
  //     await setDoc(settingsDocRef, settingsData);
  //     return settings;
  //   } catch (error) {
  //     console.error('Failed to create settings:', error);
  //     return null;
  //   }
  // }

  // async getSettings(userId: string): Promise<Settings | null> {
  //   const settingsDocRef = doc(this.firestore, `users/${userId}/settings`);
  //   try {
  //     const docSnap = await getDoc(settingsDocRef);
  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       return JSON.parse(JSON.stringify(data)); // Convert Firestore data to Settings object
  //     } else {
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('Failed to get settings:', error);
  //     return null;
  //   }
  // }

  // async updateSettings(userId: string, settings: Settings): Promise<void> {
  //   const settingsDocRef = doc(this.firestore, `users/${userId}/settings`);
  //   try {
  //     const settingsData = JSON.parse(JSON.stringify(settings)); // Convert Settings to a plain object for update
  //     await updateDoc(settingsDocRef, settingsData);
  //   } catch (error) {
  //     console.error('Failed to update settings:', error);
  //     throw error;
  //   }
  // }

  async createSettings(
    userId: string,
    settings: Settings
  ): Promise<Settings | null> {
    const settingsDocRef = doc(
      this.firestore,
      `users/${userId}/settings/${userId}`
    );
    try {
      const settingsData = JSON.parse(JSON.stringify(settings));
      await setDoc(settingsDocRef, settingsData);
      return settings;
    } catch (error) {
      console.error('Failed to create settings:', error);
      return null;
    }
  }

  async getSettings(userId: string): Promise<Settings | null> {
    const settingsDocRef = doc(
      this.firestore,
      `users/${userId}/settings/${userId}`
    );
    try {
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return JSON.parse(JSON.stringify(data));
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get settings:', error);
      return null;
    }
  }

  async updateSettings(userId: string, settings: Settings): Promise<void> {
    const settingsDocRef = doc(
      this.firestore,
      `users/${userId}/settings/${userId}`
    );
    try {
      const settingsData = JSON.parse(JSON.stringify(settings));
      await setDoc(settingsDocRef, settingsData, { merge: true });
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  // async createScore(userId: string, score: Score): Promise<Score | null> {
  //   const scoreDocRef = doc(this.firestore, `users/${userId}/score`);
  //   try {
  //     const scoreData = JSON.parse(JSON.stringify(score)); // Convert Score to a plain object
  //     await setDoc(scoreDocRef, scoreData);
  //     return score;
  //   } catch (error) {
  //     console.error('Failed to create score:', error);
  //     return null;
  //   }
  // }

  // async getScore(userId: string): Promise<Score | null> {
  //   const scoreDocRef = doc(this.firestore, `users/${userId}/score`);
  //   try {
  //     const docSnap = await getDoc(scoreDocRef);
  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       return JSON.parse(JSON.stringify(data)); // Convert Firestore data to Score object
  //     } else {
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('Failed to get score:', error);
  //     return null;
  //   }
  // }

  // async updateScore(userId: string, score: Score): Promise<void> {
  //   const scoreDocRef = doc(this.firestore, `users/${userId}/score`);
  //   try {
  //     const scoreData = JSON.parse(JSON.stringify(score)); // Convert Score to a plain object for update
  //     await updateDoc(scoreDocRef, scoreData);
  //   } catch (error) {
  //     console.error('Failed to update score:', error);
  //     throw error;
  //   }
  async createScore(userId: string, score: Score): Promise<Score | null> {
    const scoreDocRef = doc(this.firestore, `users/${userId}/scores/${userId}`);
    try {
      const scoreData = JSON.parse(JSON.stringify(score));
      await setDoc(scoreDocRef, scoreData);
      return score;
    } catch (error) {
      console.error('Failed to create score:', error);
      return null;
    }
  }

  async getScore(userId: string): Promise<Score | null> {
    const scoreDocRef = doc(this.firestore, `users/${userId}/scores/${userId}`);
    try {
      const docSnap = await getDoc(scoreDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return JSON.parse(JSON.stringify(data));
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get score:', error);
      return null;
    }
  }

  async updateScore(userId: string, score: Score): Promise<void> {
    const scoreDocRef = doc(this.firestore, `users/${userId}/scores/${userId}`);
    try {
      const scoreData = JSON.parse(JSON.stringify(score));
      await setDoc(scoreDocRef, scoreData, { merge: true });
    } catch (error) {
      console.error('Failed to update score:', error);
      throw error;
    }
  }
}
