import { Injectable } from '@angular/core';
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
import { TaskoratorUserProfile } from '../models/user';
import { TaskTemplate } from '../models/template';
import { Task } from '../../../models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  userProfile: TaskoratorUserProfile = {
    canCreate: false,
    allowedTemplates: [], // Initially empty, or predefined IDs could be listed here
    canUseGpt: false,
    role: 'basic',
  };
  constructor(private firestore: Firestore) {}

  getUser(userId: string): unknown {
    // firestore = this.firestore;
    // userBaseRef = doc(firestore, `users/${userId}`);
    return undefined;
  }

  isUserAdmin(userId: string): boolean {
    return false;
  }

  /**
   *
   * @deprecated do not use, delete, only use once to fix my tasks...
   */
  async fetchAllTasks(): Promise<Task[]> {
    const taskCollectionRef = collection(this.firestore, 'tasks');
    const querySnapshot = await getDocs(taskCollectionRef);
    return querySnapshot.docs.map((doc) => doc.data() as Task);
  }

  async createTemplate(template: TaskTemplate): Promise<void> {
    const templateRef = doc(collection(this.firestore, 'templates'));
    return setDoc(templateRef, template);
  }

  async getTemplate(templateId: string): Promise<TaskTemplate | null> {
    const templateRef = doc(this.firestore, `templates/${templateId}`);
    const templateSnap = await getDoc(templateRef);
    return templateSnap.exists() ? (templateSnap.data() as TaskTemplate) : null;
  }

  async createTemplateWithTasks(templateData: TaskTemplate): Promise<void> {
    const batch = writeBatch(this.firestore);
    const templateRef = doc(collection(this.firestore, 'templates'));
    batch.set(templateRef, { ...templateData, id: templateRef.id }); // Set template data with a new ID

    // Adding tasks to the template
    templateData.tasks.forEach((task) => {
      const taskRef = doc(
        collection(this.firestore, `templates/${templateRef.id}/tasks`)
      );
      batch.set(taskRef, task);
    });

    return await batch.commit(); // Commit the batch to save all changes in one go
  }

  // firebase database: tasks, test, users
  // move tasks to templates with new id, which is probably created randomly
  // let me get that template on demand
  // create interface for such a template
}

// firebase templates
// the actual reference to templates are not created yet
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {

//     // Ensure all users are authenticated to interact with any collection
//     match /{document=**} {
//       allow read, write: if request.auth != null;
//     }

//     // Users collection specific rules
//     match /users/{userId} {
//       // Allow users to read their own profile
//       allow read: if request.auth.uid == userId;

//       // Allow users to update their own profile but not their role or permissions fields
//       allow update: if request.auth.uid == userId &&
//         !(request.resource.data.keys().hasAny(['canCreate', 'allowedTemplates', 'canUseGpt', 'role']));

//       // Prevent any user from changing their role or permissions fields
//       allow write: if false;
//     }

//     // Templates collection specific rules
//     match /templates/{templateId} {
//       // Allow read if the template is public or if user has the specific template ID in their 'allowedTemplates'
//       allow read: if resource.data.public == true ||
//         (request.auth.uid != null && templateId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.allowedTemplates);

//       // Allow users to create new templates if they have the 'canCreateTemplates' permission
//       allow create: if request.auth.uid != null &&
//         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.canCreate == true;

//       // General write permissions should still ensure that the user is authenticated
//       allow write: if request.auth.uid != null;
//     }
//   }
// }
