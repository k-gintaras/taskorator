import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { RouteMetadata } from '../app.routes-models';
import { NavigationBuilderService } from './navigation-builder.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private currentFeature$ = new BehaviorSubject<string | null>(null);
  private currentChild$ = new BehaviorSubject<string | null>(null);
  private redirectUrl: string | null = null;

  constructor(
    private router: Router,
    private navigationBuilder: NavigationBuilderService
  ) {
    // Listen for navigation changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncNavigationState();
      });
  }

  /**
   * Save the intended URL for redirection after login.
   */
  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }

  /**
   * Retrieve the saved redirect URL.
   */
  async getRedirectUrl(): Promise<string | null> {
    return this.redirectUrl;
  }

  /**
   * Clear the redirect URL after redirection.
   */
  clearRedirectUrl() {
    this.redirectUrl = null;
  }

  /**
   * Get the current feature as an observable.
   */
  getCurrentFeature() {
    return this.currentFeature$.asObservable();
  }

  /**
   * Get the current child as an observable.
   */
  getCurrentChild() {
    return this.currentChild$.asObservable();
  }

  getTopLevelFeatures() {
    return this.navigationBuilder.getTopLevelFeatures();
  }

  /**
   * Synchronize navigation state based on the final resolved URL.
   */
  private syncNavigationState() {
    const currentUrl = this.router.url;

    // Determine the top-level feature
    const feature = this.navigationBuilder
      .getTopLevelFeatures()
      .find((f) => currentUrl.startsWith(`/${f.path}`));

    if (feature) {
      this.currentFeature$.next(feature.path);

      // Check for matching child paths
      const childMatch = this.navigationBuilder
        .getChildrenPaths(feature.path)
        .find((childPath) =>
          currentUrl.startsWith(`/${feature.path}/${childPath}`)
        );

      if (childMatch) {
        this.currentChild$.next(`/${feature.path}/${childMatch}`);
      } else {
        this.currentChild$.next(null);
      }
    } else {
      this.currentFeature$.next(null);
      this.currentChild$.next(null);
    }
  }

  /**
   * Retrieve metadata for a route.
   * @param path - Route path to fetch metadata for.
   */
  getRouteMetadata(path: string): RouteMetadata {
    return this.navigationBuilder.getRouteMetadata(path);
  }

  /**
   * Retrieve child paths for a feature.
   * @param featurePath - Path of the feature.
   */
  getChildrenPaths(featurePath: string): string[] {
    return this.navigationBuilder.getChildrenPaths(featurePath);
  }
}
