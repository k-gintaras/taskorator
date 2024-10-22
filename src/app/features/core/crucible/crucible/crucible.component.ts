import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CORE_APP_PATHS } from '../../../../app.core-paths.module';

@Component({
  selector: 'app-crucible',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './crucible.component.html',
  styleUrl: './crucible.component.scss',
})
export class CrucibleComponent {
  data = CORE_APP_PATHS['crucible'];
}
