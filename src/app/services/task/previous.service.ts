import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { lastValueFrom, take } from 'rxjs';
import { Settings } from 'src/app/models/settings';
import { TaskService } from './task.service';
import { ROOT_TASK_ID } from 'src/app/models/taskModelManager';

@Injectable({
  providedIn: 'root',
})
export class PreviousService {
  constructor(private taskService: TaskService) {}
  // instead of this.loadOverlordAndChildren(firstTaskId) just return the id
  // please rewrite it and keep in mind that it has async part, so beware of return value and modify if needed

  async getPreviousOverlordId(
    route: ActivatedRoute,
    settings: Settings
  ): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve) => {
      // First, subscribe to queryParams to check for an 'overlord' in the URL
      route.queryParams.pipe(take(1)).subscribe(async (params) => {
        let overlordId = params['selectedOverlord']; // Attempt to get the overlord ID from URL

        if (!overlordId) {
          // Fallback to settings if URL doesn't contain the desired param
          overlordId = settings?.lastOverlordViewId;

          // Further fallback to a default action (e.g., getting the first task) if no suitable ID is found
          if (!overlordId) {
            // Assuming `getFirstTaskId` is a method that retrieves the ID of the first task
            try {
              // const firstTaskId: string | undefined =
              //   await this.taskService.getLatestTaskId();
              // resolve(firstTaskId);
              resolve(ROOT_TASK_ID); // just give back root
            } catch (error) {
              console.error('Error retrieving the latest task ID:', error);
              resolve(undefined);
            }
            return;
          }
        } else {
          console.log('no url task');
        }
        resolve(overlordId);
      });
    });
  }
}
