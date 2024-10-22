import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatFabButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {
  getPathMap,
  getRouteMetadata,
  PathItem,
} from '../../app.routing.models';
import { RouteMetadata } from '../../app.core-paths.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-horizontal-navigation',
  standalone: true,
  templateUrl: './horizontal-navigation.component.html',
  styleUrls: ['./horizontal-navigation.component.scss'],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    RouterOutlet,
    MatFabButton,
  ],
})
export class HorizontalNavigationComponent implements OnInit {
  currentNavItems: { path: string; metadata: RouteMetadata }[] = [];
  navStack: { path: string; metadata: RouteMetadata }[][] = [];
  pathMap: { [key: string]: PathItem } = getPathMap();
  lastCorePath: PathItem | undefined;
  viewingParent = true;
  isHandset: boolean = false;

  @ViewChild('drawer') drawer!: MatDrawer;

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.updateNavItems(this.pathMap); // Start at the top level
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isHandset = result.matches;
      });
  }

  onNavItemClick(item: { path: string; metadata: RouteMetadata }) {
    const selectedItem = this.currentNavItems.find(
      (navItem) => navItem.path === item.path
    );
    if (selectedItem) {
      const currentCorePath = this.pathMap[selectedItem.path];

      if (currentCorePath) {
        // Core item clicked, show child items but keep drawer open
        this.viewingParent = true;
        this.lastCorePath = currentCorePath;
        const children = currentCorePath.children;

        if (children?.length) {
          this.updateMenu(children); // Show child items
        }
        this.router.navigate([item.path]);
      } else {
        // Child item clicked, close the drawer
        const subPath = `${this.lastCorePath?.path}/${item.path}`;
        this.router.navigate([subPath]);
        this.viewingParent = false;

        // Close the drawer on mobile when navigating a child
        if (this.isHandset && this.drawer) {
          this.drawer.toggle();
        }
      }
    }
  }

  onBackClick() {
    if (this.lastCorePath) {
      this.updateNavItems(this.pathMap); // Go back to the top-level (core) items
      this.router.navigate([this.lastCorePath.path]); // Navigate back to the core path
      this.viewingParent = true; // Reset to viewing the parent (core) level

      // Keep the drawer open when clicking back on mobile
      if (this.isHandset && this.drawer) {
        this.drawer.open();
      }
    }
  }

  updateNavItems(pathMap: { [key: string]: PathItem }) {
    this.currentNavItems = this.convertPathsToNavItems(Object.keys(pathMap));
  }

  updateMenu(children: string[]) {
    this.currentNavItems = this.convertPathsToNavItems(children);
    this.viewingParent = false; // Indicate that we're viewing children
  }

  toggleDrawer() {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  canGoBack(): boolean {
    return !this.viewingParent;
  }

  isSelected(path: string): boolean {
    return this.router.url.includes(path);
  }

  convertPathsToNavItems(
    paths: string[]
  ): { path: string; metadata: RouteMetadata }[] {
    return paths.map((path) => {
      const metadata = getRouteMetadata(path) || {
        title: 'Unnamed Route',
        altName: 'Unnamed Route',
        icon: 'extension',
        description: '',
      };
      return { path, metadata };
    });
  }
}
