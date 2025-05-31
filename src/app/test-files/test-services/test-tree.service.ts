import { Injectable } from '@angular/core';
import { EventBusService } from '../../services/core/event-bus.service';
import { TreeService } from '../../services/sync-api-cache/tree.service';

@Injectable({
  providedIn: 'root',
})
export class TestTreeService {
  constructor(
    private treeService: TreeService,
    private eventBus: EventBusService
  ) {}

  async runTests(): Promise<void> {
    console.log('Starting TreeDebugService tests...');

    // Test 1: Create Task Event
    const testTask = { taskId: '1', name: 'Test Task' };
    this.eventBus.emit('createTask', testTask);

    // Test 2: Update Tree Directly
    const tree = this.treeService.getLatestTree();
    if (tree) {
      console.log('Current tree:', tree);
      tree.primarch.name = 'Updated Root';
      this.treeService.updateTree(tree);
    } else {
      console.warn('No tree available for update.');
    }

    // Test 3: Fetch Tree
    const fetchedTree = this.treeService.getLatestTree();
    console.log('Fetched tree:', fetchedTree);
  }
}
