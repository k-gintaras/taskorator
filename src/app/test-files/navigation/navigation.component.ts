import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouteMetadata } from '../../app.routes-models';
import { CORE_APP_METADATA } from '../../app.routes-metadata';

@Component({
  selector: 'app-navigation',
  standalone: true,
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    RouterOutlet,
  ],
})
export class NavigationComponent implements OnInit {
  currentNavItems: { path: string; metadata: RouteMetadata }[] = [];
  navStack: { path: string; metadata: RouteMetadata }[][] = [];
  lastCorePath: string | null = null;
  viewingParent = true;
  isHandset: boolean = false;

  @ViewChild('drawer') drawer!: MatDrawer;

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.updateNavItems(); // Start at the top level
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isHandset = result.matches;
      });
  }

  onNavItemClick(item: { path: string; metadata: RouteMetadata }) {
    if (item.path === this.lastCorePath) {
      // Handle clicks on parent (core) path
      this.viewingParent = true;
      this.updateNavItems(); // Show top-level items
    } else {
      const children = this.getChildrenPaths(item.path);
      if (children?.length) {
        // If the route has children, update the menu to show them
        this.viewingParent = false;
        this.lastCorePath = item.path;
        this.updateMenu(children);
      } else {
        // Otherwise, navigate to the child route
        this.router.navigate([item.path]);
        this.closeDrawerOnMobile();
      }
    }
  }

  onBackClick() {
    if (this.lastCorePath) {
      this.updateNavItems(); // Go back to the top-level
      this.router.navigate([this.lastCorePath]); // Navigate back to the parent path
      this.viewingParent = true;
    }
  }

  updateNavItems() {
    // Update to show top-level navigation items
    this.currentNavItems = this.getTopLevelPaths().map(this.toNavItem);
  }

  updateMenu(children: string[]) {
    // Update to show child navigation items
    this.currentNavItems = children.map(this.toNavItem);
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

  closeDrawerOnMobile() {
    if (this.isHandset && this.drawer) {
      this.drawer.toggle();
    }
  }

  toNavItem = (path: string): { path: string; metadata: RouteMetadata } => {
    const metadata = CORE_APP_METADATA[path] || {
      title: 'Unnamed Route',
      description: '',
      icon: 'extension',
    };
    return { path, metadata };
  };

  getTopLevelPaths(): string[] {
    // Mock function to get top-level paths; replace with actual implementation
    return ['forge', 'sentinel', 'nexus', 'vortex', 'crucible', 'citadel'];
  }

  getChildrenPaths(path: string): string[] | undefined {
    // Mock function to get child paths for a route; replace with actual implementation
    const childMap: Record<string, string[]> = {
      forge: ['subforge1', 'subforge2'],
      sentinel: ['subsentinel1', 'subsentinel2'],
    };
    return childMap[path];
  }
}
