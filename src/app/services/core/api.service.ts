import { Injectable } from '@angular/core';
import { ApiStrategy } from './interfaces/api-strategy.interface';
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  writeBatch,
  query,
  where,
  limit,
  orderBy,
  getDoc,
  setDoc,
  getDocs,
  runTransaction,
} from '@angular/fire/firestore';
import { RegisterUserResult } from './interfaces/register-user';
import { Task, getDefaultTask } from 'src/app/models/taskModelManager';
import { Settings } from 'src/app/models/settings';
import { Score } from 'src/app/models/score';
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

  private getScoreLocation(userId: string) {
    return `users/${userId}/scores/${userId}`;
  }

  private getSettingsLocation(userId: string) {
    return `users/${userId}/settings/${userId}`;
  }

  private getTasksLocation(userId: string) {
    return `users/${userId}/tasks`;
  }

  private getTreeLocation(userId: string) {
    return `users/${userId}/taskTrees/${userId}`;
  }

  async register(
    userId: string,
    initialTask: Task,
    additionalTasks: Task[],
    settings: Settings,
    score: Score,
    tree: TaskTree
  ): Promise<RegisterUserResult> {
    const firestore = this.firestore;
    console.log('registering: ' + userId);
    if (!userId) {
      throw new Error('No user id in user credentials @registerUser()');
    }

    try {
      await runTransaction(firestore, async (transaction) => {
        const userBaseRef = doc(firestore, `users/${userId}`);
        const userProfile = {
          canCreate: false,
          allowedTemplates: [], // Initially empty, or predefined IDs could be listed here
          canUseGpt: false,
          role: 'basic',
        };
        transaction.set(userBaseRef, userProfile);

        // Handling task creation within the transaction
        const userTaskCollectionRef = collection(
          firestore,
          this.getTasksLocation(userId)
        );
        const initialTaskDocRef = doc(
          userTaskCollectionRef,
          initialTask.taskId
        );
        transaction.set(initialTaskDocRef, initialTask);
        additionalTasks.forEach((task) => {
          const taskDocRef = doc(userTaskCollectionRef, task.taskId);
          transaction.set(taskDocRef, task);
        });

        // Settings, Score, and TaskTree
        const settingsDocRef = doc(firestore, this.getSettingsLocation(userId));
        transaction.set(settingsDocRef, settings);
        const scoreDocRef = doc(firestore, this.getScoreLocation(userId));
        transaction.set(scoreDocRef, score);
        const treeDocRef = doc(firestore, this.getTreeLocation(userId));
        transaction.set(treeDocRef, tree);
      });

      return {
        success: true,
        message: 'User registration successful',
        userId: userId,
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw {
        success: false,
        message: 'User registration failed',
      };
    }
  }
  // async register(
  //   userId: string,
  //   initialTask: Task,
  //   additionalTasks: Task[],
  //   settings: Settings,
  //   score: Score,
  //   tree: TaskTree
  // ): Promise<RegisterUserResult> {
  //   console.log('registering: ' + userId);
  //   if (!userId) {
  //     throw new Error('No user id in user credentials @registerUser()');
  //   }

  //   try {
  //     await runTransaction(this.firestore, async (transaction) => {
  //       const userTaskCollectionRef = collection(
  //         this.firestore,
  //         `users/${userId}/tasks`
  //       );

  //       // Create the initial task with the provided taskId
  //       const initialTaskDocRef = doc(
  //         userTaskCollectionRef,
  //         initialTask.taskId
  //       );
  //       transaction.set(initialTaskDocRef, initialTask);

  //       // Create additional tasks with their provided taskId
  //       additionalTasks.forEach((task) => {
  //         const taskDocRef = doc(userTaskCollectionRef, task.taskId);
  //         transaction.set(taskDocRef, task);
  //       });

  //       const settingsDocRef = doc(
  //         this.firestore,
  //         `users/${userId}/settings/${userId}`
  //       );
  //       transaction.set(settingsDocRef, settings);

  //       const scoreDocRef = doc(
  //         this.firestore,
  //         `users/${userId}/scores/${userId}`
  //       );
  //       transaction.set(scoreDocRef, score);

  //       const treeDocRef = doc(
  //         this.firestore,
  //         `users/${userId}/taskTrees/${userId}`
  //       );
  //       transaction.set(treeDocRef, tree);
  //     });

  //     const result: RegisterUserResult = {
  //       success: true,
  //       message: 'User registration successful',
  //       userId: userId,
  //     };
  //     return result;
  //   } catch (error) {
  //     console.error('Registration failed:', error);
  //     const result: RegisterUserResult = {
  //       success: false,
  //       message: 'User registration failed',
  //     };
  //     throw result;
  //   }
  // }

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
    if (!task.overlord) {
      task.overlord = getDefaultTask().overlord;
    }
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

  async createTaskWithCustomId(
    userId: string,
    task: Task,
    taskId: string
  ): Promise<Task> {
    console.log('trying to create first task on server');
    if (!task.overlord) {
      task.overlord = getDefaultTask().overlord;
    }
    const userTaskCollectionRef = collection(
      this.firestore,
      `users/${userId}/tasks`
    );
    const taskDocRef = doc(userTaskCollectionRef, taskId); // Prepare a new document reference within user's tasks collection
    const newTask = { ...task, taskId: taskDocRef.id }; // Add taskId to the task

    try {
      await setDoc(taskDocRef, newTask); // Directly set the new task document with the generated ID
      console.log('created');
      console.log(newTask);

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

  async getTaskById(userId: string, taskId: string): Promise<Task | undefined> {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    if (!taskId) {
      throw new Error('Missing task ID for update');
    }
    const docRef = doc(this.firestore, `users/${userId}/tasks/${taskId}`);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { taskId: snapshot.id, ...snapshot.data() } as Task;
    }
    return undefined;
  }

  async getLatestTaskId(userId: string): Promise<string | undefined> {
    const tasksRef = query(
      collection(this.firestore, `users/${userId}/tasks`),
      orderBy('timeCreated', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(tasksRef);
    const tasks = querySnapshot.docs.map((doc) => ({
      taskId: doc.id,
      ...doc.data(),
    }));
    return tasks[0]?.taskId;
  }

  async getSuperOverlord(
    userId: string,
    overlordId: string
  ): Promise<Task | undefined> {
    const overlordDocRef = doc(
      this.firestore,
      `users/${userId}/tasks/${overlordId}`
    );
    const overlordSnapshot = await getDoc(overlordDocRef);
    if (overlordSnapshot.exists()) {
      const overlord = {
        taskId: overlordSnapshot.id,
        ...overlordSnapshot.data(),
      } as Task;
      if (!overlord.overlord) {
        return undefined;
      }
      const superOverlordDocRef = doc(
        this.firestore,
        `users/${userId}/tasks/${overlord.overlord}`
      );
      const superOverlordSnapshot = await getDoc(superOverlordDocRef);
      if (superOverlordSnapshot.exists()) {
        return {
          taskId: superOverlordSnapshot.id,
          ...superOverlordSnapshot.data(),
        } as Task;
      }
    }
    return undefined;
  }

  async getOverlordChildren(
    userId: string,
    overlordId: string
  ): Promise<Task[] | undefined> {
    console.log(
      'get -> real API overlordId ******************************************'
    );
    console.log(
      `Fetching tasks for overlordId: ${overlordId} and userId: ${userId}`
    );

    const tasksCollection = collection(this.firestore, `users/${userId}/tasks`);
    const queryConstraint = query(
      tasksCollection,
      where('overlord', '==', overlordId)
    );

    console.log(
      `Executing query on Firestore: users/${userId}/tasks with overlord == ${overlordId}`
    );
    const querySnapshot = await getDocs(queryConstraint);

    console.log(
      `Query executed. Found ${querySnapshot.docs.length} documents.`
    );
    if (!querySnapshot.empty) {
      const tasks = querySnapshot.docs.map(
        (doc) => ({ taskId: doc.id, ...doc.data() } as Task)
      );
      console.log(`Mapped ${tasks.length} tasks from documents.`);
      return tasks;
    } else {
      console.log('No tasks found for the specified overlord ID.');
      return undefined;
    }
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
        // just set default, let user sort it out themselves later
        task.overlord = getDefaultTask().overlord;
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
    const treeDocRef = doc(
      this.firestore,
      `users/${userId}/taskTrees/${userId}`
    ); // firebase store stuff inside stuff with keys, so it has to be inside a unique key
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
