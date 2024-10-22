import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CORE_APP_PATHS } from '../../../../app.core-paths.module';

@Component({
  selector: 'app-citadel',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './citadel.component.html',
  styleUrl: './citadel.component.scss',
})
export class CitadelComponent {
  data = CORE_APP_PATHS['citadel'];
}
