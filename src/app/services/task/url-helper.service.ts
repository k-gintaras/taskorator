import { Injectable } from '@angular/core';
import { Task } from '../../models/taskModelManager';
import { ActivatedRoute, Router } from '@angular/router';
/**
 * @fix or @deprecated use ExtendedTask for ui... or extend task to have "selected" property, none of componetns use this yet...
 */
@Injectable({
  providedIn: 'root',
})
export class UrlHelperService {
  selectedOverlordUrlUpdate(task: Task, router: Router, route: ActivatedRoute) {
    router.navigate([], {
      relativeTo: route,
      queryParams: { selectedOverlord: task.taskId },
      queryParamsHandling: 'merge',
    });
  }
}
