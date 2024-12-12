import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CORE_APP_METADATA } from '../../../../app.routes-metadata';

@Component({
  selector: 'app-gateway',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './gateway.component.html',
  styleUrl: './gateway.component.scss',
})
export class GatewayComponent {
  data = CORE_APP_METADATA['gateway'];
}
