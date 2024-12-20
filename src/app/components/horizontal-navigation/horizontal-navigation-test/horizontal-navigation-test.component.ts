import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouteMetadata } from '../../../app.routes-models';
import { NavigationBuilderService } from '../../../services/navigation-builder.service';
import { TaskNavigatorTestComponent } from '../../task-navigator/task-navigator-test/task-navigator-test.component';

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
    TaskNavigatorTestComponent,
  ],
  templateUrl: './horizontal-navigation-test.component.html',
  styleUrls: ['../horizontal-navigation.component.scss'],
})
export class HorizontalNavigationComponentTest implements OnInit {
  navItems: { path: string; metadata: RouteMetadata }[] = [];
  viewingChildren = false;
  isHandset = false;
  selectedFeature = '';
  selectedChild = '';

  @ViewChild('drawer') drawer!: MatDrawer;

  constructor(
    private router: Router,
    private navigationService: NavigationBuilderService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.showTopLevel(); // Initialize at top level
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isHandset = result.matches;
      });
  }

  isSelected(path: string) {
    // return true;
    this.selectedChild === path || this.selectedFeature === path;
  }

  /**
   * Show top-level features.
   */
  showTopLevel() {
    this.navItems = this.navigationService
      .getTopLevelFeatures()
      .map((feature) => ({
        path: feature.path,
        metadata: feature.metadata,
      }));
    this.viewingChildren = false;
  }

  /**
   * Show children for the selected feature or navigate directly.
   * @param item - The selected navigation item.
   */
  onNavItemClick(item: { path: string; metadata: RouteMetadata }) {
    const childrenPaths = this.navigationService.getChildrenPaths(item.path);

    if (childrenPaths.length > 0) {
      // its a feature

      this.navItems = childrenPaths.map((childPath) => ({
        path: `${item.path}/${childPath}`,
        metadata: this.navigationService.getRouteMetadata(childPath),
      }));
      this.viewingChildren = true;
      this.selectedChild = item.path;
      // prenavigate automatically to default path for convenience
      // or inconvenience
      this.router.navigate([item.path]);
    } else {
      // child of feature
      this.router.navigate([item.path]); // Navigate directly
      this.closeDrawerOnMobile();
      this.selectedFeature = item.path;
    }
  }

  /**
   * Return to the top-level navigation.
   */
  onBackClick() {
    this.showTopLevel();
  }

  toggleDrawer() {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  closeDrawerOnMobile() {
    if (this.isHandset && this.drawer) {
      this.drawer.close();
    }
  }

  canGoBack() {
    return this.viewingChildren;
  }
}
