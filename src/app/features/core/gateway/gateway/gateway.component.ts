import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CORE_APP_PATHS } from '../../../../app.core-paths.module';

@Component({
  selector: 'app-gateway',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './gateway.component.html',
  styleUrl: './gateway.component.scss',
})
export class GatewayComponent {
  data = CORE_APP_PATHS['gateway'];
}
