import { Component, Input } from '@angular/core';
import { TaskNodeInfo } from '../../models/taskTree';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-chunked-progress',
  standalone: true,
  imports: [NgClass],
  templateUrl: './chunked-progress.component.html',
  styleUrl: './chunked-progress.component.scss',
})
export class ChunkedProgressComponent {
  @Input() treeNode!: TaskNodeInfo | null;

  getChunkArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }
}
