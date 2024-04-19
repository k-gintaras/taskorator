import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  activeDrawer: string | undefined;
  @ViewChild('drawer') drawer: { toggle: () => void } | undefined;
  isDrawerOpen = false;

  // toggleDrawer(type: string) {
  //   this.activeDrawer = type;
  //   if (this.drawer) this.drawer.toggle();
  // }
  // Add a new property to track the drawer's open state

  toggleDrawer(type: string) {
    if (this.activeDrawer !== type) {
      // Set the activeDrawer to the current type.
      this.activeDrawer = type;

      // If the drawer is not open, open it.
      if (!this.isDrawerOpen) {
        this.isDrawerOpen = true;
        if (this.drawer) this.drawer.toggle();
      }
    } else {
      // If the same type is clicked, toggle the drawer and update isDrawerOpen.
      if (this.drawer) {
        this.drawer.toggle();
        this.isDrawerOpen = !this.isDrawerOpen;
      }
    }
  }
}
