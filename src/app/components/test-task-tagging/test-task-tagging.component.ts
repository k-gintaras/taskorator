import { Component, OnInit } from '@angular/core';
import { TagManagerModule, quickTagSetup } from '@ubaby/componentator';

@Component({
  selector: 'app-test-task-tagging',
  standalone: true,
  imports: [TagManagerModule],
  templateUrl: './test-task-tagging.component.html',
  styleUrls: ['./test-task-tagging.component.scss'],
})
export class TestTaskTaggingComponent implements OnInit {
  tagGroups: any[] = [];
  items: any[] = [];

  ngOnInit(): void {
    const setup = quickTagSetup('project-tasks');
    this.tagGroups = setup.tagGroups;
    this.items = setup.items;
  }

  onTagAdded(event: any) {
    console.log('Tag added to item:', event);
  }

  onTagRemoved(event: any) {
    console.log('Tag removed from item:', event);
  }
}
