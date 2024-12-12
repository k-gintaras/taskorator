import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CORE_APP_METADATA } from '../../../../app.routes-metadata';

@Component({
  selector: 'app-crucible',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './crucible.component.html',
  styleUrl: './crucible.component.scss',
})
export class CrucibleComponent {
  data = CORE_APP_METADATA['crucible'];
}
