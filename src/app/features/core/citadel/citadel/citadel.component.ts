import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CORE_APP_METADATA } from '../../../../app.routes-metadata';

@Component({
  selector: 'app-citadel',
  standalone: true,
  imports: [RouterOutlet, MatIcon],
  templateUrl: './citadel.component.html',
  styleUrl: './citadel.component.scss',
})
export class CitadelComponent {
  data = CORE_APP_METADATA['citadel'];
}
