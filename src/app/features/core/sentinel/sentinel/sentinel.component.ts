import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CORE_APP_METADATA } from '../../../../app.routes-metadata';
@Component({
  selector: 'app-sentinel',
  standalone: true,
  templateUrl: './sentinel.component.html',
  styleUrls: ['./sentinel.component.scss'],
  imports: [RouterOutlet],
})
export class SentinelComponent {
  data = CORE_APP_METADATA['sentinel'];
}
