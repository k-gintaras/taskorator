import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CORE_APP_METADATA } from '../../../../app.routes-metadata';

@Component({
  selector: 'app-vortex',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './vortex.component.html',
  styleUrl: './vortex.component.scss',
})
export class VortexComponent {
  data = CORE_APP_METADATA['vortex'];
}
