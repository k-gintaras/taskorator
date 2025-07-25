import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { RouteMetadata } from '../../app.routes-models';
import { NavigationService } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SearchCreateComponent } from '../search-create/search-create.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NotificationComponent } from '../notification/notification.component';
import { filter } from 'rxjs/operators';
import { ArtificerComponent } from '../artificer/artificer.component';
@Component({
  selector: 'app-horizontal-navigation',
  standalone: true,
  imports: [
    ArtificerComponent,
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterOutlet,
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
  showArtificer = true;

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
    const activeParent = this.parentItems.find((p) =>
      this.currentUrl.startsWith('/' + p.path)
    );
    if (!activeParent) {
      this.childItems = [];
      return;
    }

    this.childItems = this.navigationService
      .getChildrenPaths(activeParent.path)
      // drop routes like "tasks/:taskId" or anything without metadata
      .filter(
        (child) =>
          !child.includes(':') &&
          !!this.navigationService.getRouteMetadata(child)
      )
      .map((child) => ({
        path: `${activeParent.path}/${child}`,
        metadata: this.navigationService.getRouteMetadata(child)!,
      }));
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
    this.isCompact = window.innerWidth < 1000;
    this.isHandset = window.innerWidth < 650;
    if (this.isCompact && this.drawer.opened) {
      this.drawer.close();
    }
  }
}
