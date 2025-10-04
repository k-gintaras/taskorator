import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CORE_APP_METADATA } from '../../../../app.routes-metadata';

@Component({
  selector: 'app-dreamforge',
  standalone: true,
  imports: [RouterOutlet, MatIcon],
  templateUrl: './dreamforge.component.html',
  styleUrl: './dreamforge.component.scss',
})
export class DreamforgeComponent {
  data = CORE_APP_METADATA['dreamforge'];
}
