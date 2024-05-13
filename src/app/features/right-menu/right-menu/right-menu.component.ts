import { Component } from '@angular/core';
import { RightMenuService } from '../services/right-menu.service';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-right-menu',
  standalone: true,
  imports: [MatIcon, MatButton],
  templateUrl: './right-menu.component.html',
  styleUrl: './right-menu.component.scss',
})
export class RightMenuComponent {
  constructor(private rightMenuService: RightMenuService) {}

  toggleShowMore(event: any) {
    if (event) event.stopPropagation();

    this.rightMenuService.toggleShowMore();
  }
}
