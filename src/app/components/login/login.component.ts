import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(email: string, password: string): void {
    this.authService
      .loginWithEmailAndPassword(email, password)
      .then(() => {
        this.router.navigate(['/protected']);
      })
      .catch((error) => {
        console.error('Login error:', error);
      });
  }
}
