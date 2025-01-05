import { Injectable } from '@angular/core';
import { EventBusService } from '../../services/core/event-bus.service';
import { TreeService } from '../../services/core/tree.service';

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
    const tree = await this.treeService.getTreeOnce();
    if (tree) {
      console.log('Current tree:', tree);
      tree.root.name = 'Updated Root';
      this.treeService.updateTree(tree);
    } else {
      console.warn('No tree available for update.');
    }

    // Test 3: Fetch Tree
    const fetchedTree = await this.treeService.getTreeOnce();
    console.log('Fetched tree:', fetchedTree);
  }
}
