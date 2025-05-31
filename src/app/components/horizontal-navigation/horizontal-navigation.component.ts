import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
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

@Component({
  selector: 'app-horizontal-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterOutlet,
    OverlordNavigatorComponent,
    SearchCreateComponent,
    NotificationComponent,
    NotificationComponent,
  ],
  templateUrl: './horizontal-navigation.component.html',
  styleUrls: ['./horizontal-navigation.component.scss'],
})
export class HorizontalNavigationComponent implements OnInit {
  navItems: { path: string; metadata: RouteMetadata }[] = [];
  viewingChildren = false;
  selectedFeature: string | null = null;
  selectedChild: string | null = null;
  isHandset = false;

  @ViewChild('drawer') drawer!: MatDrawer;
  isCompact: boolean = false;

  constructor(
    private navigationService: NavigationService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    // Subscribe to feature and child observables
    this.navigationService.getCurrentFeature().subscribe((feature) => {
      this.selectedFeature = feature;
      if (feature) {
        this.navItems = this.navigationService
          .getChildrenPaths(feature)
          .map((childPath) => ({
            path: `${feature}/${childPath}`,
            metadata: this.navigationService.getRouteMetadata(`${childPath}`),
          }));
        this.viewingChildren = !!this.navItems.length;
      } else {
        this.showTopLevel();
      }
    });

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isHandset = result.matches;
      });

    this.navigationService.getCurrentChild().subscribe((child) => {
      this.selectedChild = child;
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkViewport();
  }

  checkViewport() {
    this.isCompact = window.innerWidth < 600;
  }

  toggleDrawer() {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  showTopLevel() {
    this.navItems = this.navigationService.getTopLevelFeatures();
    this.viewingChildren = false;
  }

  onNavItemClick(item: { path: string; metadata: RouteMetadata }) {
    const childrenPaths = this.navigationService.getChildrenPaths(item.path);

    if (childrenPaths.length > 0) {
      this.navItems = childrenPaths.map((childPath) => ({
        path: `${item.path}/${childPath}`,
        metadata: item.metadata,
      }));
      this.viewingChildren = true;
      this.router.navigate([item.path]);
    } else {
      this.router.navigate([item.path]);
    }
  }

  onBackClick() {
    this.showTopLevel();
  }

  isSelected(path: string) {
    return this.router.url.startsWith('/' + path);
  }

  canGoBack() {
    return this.viewingChildren;
  }
}
