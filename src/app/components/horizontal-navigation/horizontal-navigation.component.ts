import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { RouteMetadata } from '../../app.routes-models';
import { NavigationService } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { OverlordNavigatorComponent } from '../overlord-navigator/overlord-navigator.component';
import { SearchCreateComponent } from '../search-create/search-create.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NotificationComponent } from '../notification/notification.component';
import { FormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import { MatNavList } from '@angular/material/list';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-horizontal-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDivider,
    MatNavList,
    RouterOutlet,
    OverlordNavigatorComponent,
    SearchCreateComponent,
    NotificationComponent,
  ],
  templateUrl: './horizontal-navigation.component.html',
  styleUrls: ['./horizontal-navigation.component.scss'],
})
export class HorizontalNavigationComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;

  parentItems: { path: string; metadata: RouteMetadata }[] = [];
  childItems: { path: string; metadata: RouteMetadata }[] = [];
  isHandset = false;
  isCompact = false;

  // Just track current URL for simplicity
  currentUrl = '';

  constructor(
    private navigationService: NavigationService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.parentItems = this.navigationService.getTopLevelFeatures();

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => (this.isHandset = result.matches));

    // Listen to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = (event as NavigationEnd).url;
        this.updateChildItems();
      });

    // Initialize on load
    this.currentUrl = this.router.url;
    this.updateChildItems();
  }

  private updateChildItems() {
    // Find parent that matches current URL
    const activeParent = this.parentItems.find((parent) =>
      this.currentUrl.startsWith('/' + parent.path)
    );

    if (activeParent) {
      const childrenPaths = this.navigationService.getChildrenPaths(
        activeParent.path
      );
      this.childItems = childrenPaths.map((child) => ({
        path: `${activeParent.path}/${child}`,
        metadata: this.navigationService.getRouteMetadata(child),
      }));
    } else {
      this.childItems = [];
    }
  }

  onParentClick(item: { path: string; metadata: RouteMetadata }) {
    this.router.navigate([item.path]);
  }

  onChildClick(child: { path: string; metadata: RouteMetadata }) {
    this.router.navigate([child.path]);
    if (this.isHandset) this.drawer.close();
  }

  // Simplified selection logic
  isSelected(path: string): boolean {
    return this.currentUrl.startsWith('/' + path);
  }

  toggleDrawer() {
    this.drawer?.toggle();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isCompact = window.innerWidth < 600;
  }
}
