import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CORE_APP_METADATA } from '../../../../app.routes-metadata';

@Component({
  selector: 'app-nexus',
  standalone: true,
  imports: [RouterOutlet, MatIcon],
  templateUrl: './nexus.component.html',
  styleUrl: './nexus.component.scss',
})
export class NexusComponent {
  data = CORE_APP_METADATA['nexus'];
}
