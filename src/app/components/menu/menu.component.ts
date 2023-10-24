import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  activeDrawer: string | undefined;
  @ViewChild('drawer') drawer: { toggle: () => void } | undefined;

  toggleDrawer(type: string) {
    this.activeDrawer = type;
    if (this.drawer) this.drawer.toggle();
  }
}
