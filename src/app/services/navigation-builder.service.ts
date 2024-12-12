import { Injectable } from '@angular/core';
import { CORE_APP_METADATA } from '../app.routes-metadata';
import { AppRouteMap } from '../app.routes-models';
import {
  citadelChildPaths,
  citadelRouteMetadata,
} from '../features/core/citadel/citadel-routes';
import {
  crucibleChildPaths,
  crucibleRouteMetadata,
} from '../features/core/crucible/crucible-routes';
import {
  dreamforgeChildPaths,
  dreamforgeRouteMetadata,
} from '../features/core/dreamforge/dreamforge-routes';
import {
  gatewayChildPaths,
  gatewayRouteMetadata,
} from '../features/core/gateway/gateway-routes';
import {
  nexusChildPaths,
  nexusRouteMetadata,
} from '../features/core/nexus/nexus-routes';
import {
  sentinelChildPaths,
  sentinelRouteMetadata,
} from '../features/core/sentinel/sentinel-routes';
import {
  vortexChildPaths,
  vortexRouteMetadata,
} from '../features/core/vortex/vortex-routes';

@Injectable({
  providedIn: 'root',
})
export class NavigationBuilderService {
  constructor() {}
  private readonly childMap: Record<string, string[]> = {
    citadel: citadelChildPaths.filter((s) => s !== ''), // Remove "" paths
    crucible: crucibleChildPaths.filter((s) => s !== ''),
    dreamforge: dreamforgeChildPaths.filter((s) => s !== ''),
    gateway: gatewayChildPaths.filter((s) => s !== ''),
    nexus: nexusChildPaths.filter((s) => s !== ''),
    sentinel: sentinelChildPaths.filter((s) => s !== ''),
    vortex: vortexChildPaths.filter((s) => s !== ''),
  };

  private readonly allMetaData: AppRouteMap = {
    ...CORE_APP_METADATA,
    ...citadelRouteMetadata,
    ...crucibleRouteMetadata,
    ...dreamforgeRouteMetadata,
    ...gatewayRouteMetadata,
    ...nexusRouteMetadata,
    ...sentinelRouteMetadata,
    ...vortexRouteMetadata,
  };

  /**
   * Retrieve top-level navigation items.
   * @returns Array of objects with paths and metadata for core features.
   */
  getTopLevelFeatures() {
    return Object.entries(CORE_APP_METADATA).map(([path, metadata]) => ({
      path,
      metadata,
    }));
  }

  /**
   * Retrieve child paths for a given feature.
   * @param path - The core feature path.
   * @returns Array of child paths.
   */
  getChildrenPaths(path: string): string[] {
    return this.childMap[path] || [];
  }

  /**
   * Retrieve metadata for a specific route path.
   * @param path - The route path to fetch metadata for.
   * @returns Metadata object or a fallback default.
   */
  getRouteMetadata(path: string) {
    return (
      this.allMetaData[path] || {
        title: 'Unnamed Route',
        description: '',
        icon: 'extension',
      }
    );
  }
}
