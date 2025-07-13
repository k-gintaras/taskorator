import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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

  constructor(private router: Router) {}
  // 7. In Gateway's WelcomeComponent, add method to go to login
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
