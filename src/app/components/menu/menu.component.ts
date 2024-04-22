import { Component, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { SettingsComponent } from '../settings/settings.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  imports: [
    MatIcon,
    MatDrawer,
    MatDrawerContent,
    SettingsComponent,
    MatDrawerContainer,
    CommonModule,
    BrowserAnimationsModule,
  ],
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
