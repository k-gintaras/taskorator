import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CORE_APP_PATHS } from '../../../../app.core-paths.module';

@Component({
  selector: 'app-nexus',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './nexus.component.html',
  styleUrl: './nexus.component.scss',
})
export class NexusComponent {
  data = CORE_APP_PATHS['nexus'];
}
