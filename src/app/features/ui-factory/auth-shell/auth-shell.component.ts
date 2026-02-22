import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HorizontalNavigationComponent } from '../../../components/horizontal-navigation/horizontal-navigation.component';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, HorizontalNavigationComponent, RouterOutlet],
  templateUrl: './auth-shell.component.html',
  styleUrls: ['./auth-shell.component.scss'],
})
export class AuthShellComponent {}
