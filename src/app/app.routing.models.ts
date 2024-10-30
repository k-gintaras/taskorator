import { Routes } from '@angular/router';
import { citadelChildren } from './features/core/citadel/citadel-routing.module';
import { crucibleChildren } from './features/core/crucible/crucible-routing.module';
import { dreamforgeChildren } from './features/core/dreamforge/dreamforge-routing.module';
import { gatewayChildren } from './features/core/gateway/gateway-routing.module';
import { nexusChildren } from './features/core/nexus/nexus-routing.module';
import { sentinelChildren } from './features/core/sentinel/sentinel-routing.module';
import { vortexChildren } from './features/core/vortex/vortex-routing.module';
import {
  AppRoute,
  AppRouteMap,
  CORE_APP_PATHS,
  RouteMetadata,
} from './app.core-paths.module';
import { ALL_APP_PATHS } from './app.all-paths.module';

export function generateAngularRoutes(appRoutes: AppRouteMap): Routes {
  return Object.values(appRoutes).map((route: AppRoute) => ({
    path: route.path, // Non-null assertion here
    component: route.component,
    loadChildren: route.loadChildren,
    canActivate: route.canActivate,
    canActivateChild: route.canActivateChild,
    children: route.children
      ? generateAngularRoutes(createAppRouteMap(route.children))
      : undefined,
  }));
}

export function getRoutes(): Routes {
  return [
    {
      path: '',
      redirectTo: CORE_APP_PATHS['sentinel'].path, // Redirect to your default path
      pathMatch: 'full',
    },
    ...generateAngularRoutes(CORE_APP_PATHS),
  ];
}

// Helper function to convert an array of AppRoutes into an AppRouteMap
function createAppRouteMap(routes: AppRoute[]): AppRouteMap {
  return routes.reduce((map, route) => {
    map[route.path] = route;
    return map;
  }, {} as AppRouteMap);
}

export function generateRouteMetadataMap(appRoutes: AppRouteMap): {
  [key: string]: RouteMetadata;
} {
  const metadataMap: { [key: string]: RouteMetadata } = {};

  Object.values(appRoutes).forEach((route: AppRoute) => {
    metadataMap[route.path] = {
      title: route.title,
      altName: route.altName,
      description: route.description,
      icon: route.icon,
    };

    if (route.children) {
      Object.assign(
        metadataMap,
        generateRouteMetadataMap(createAppRouteMap(route.children))
      );
    }
  });

  return metadataMap;
}

// Use this to generate your final routes
export const CORE_ROUTES: Routes = generateAngularRoutes(CORE_APP_PATHS);

// Generate metadata map
export const CORE_METADATA_MAP = generateRouteMetadataMap(CORE_APP_PATHS);
// all metadata
export const ALL_METADATA_MAP = generateRouteMetadataMap(ALL_APP_PATHS);

// Example of retrieving metadata for a specific route
// const metadata = getRouteMetadata('test-app');

export function getRouteMetadata(path: string): RouteMetadata | undefined {
  const allPaths = { ...CORE_APP_PATHS, ...ALL_APP_PATHS };

  // Search for the path in the objects
  for (const key in allPaths) {
    if (allPaths[key].path === path) {
      return allPaths[key];
    }
  }

  // If no match is found, return undefined
  return undefined;
}

export interface PathItem {
  path: string;
  children: string[];
}

export function getPathMap(): { [key: string]: PathItem } {
  return {
    citadel: {
      path: CORE_APP_PATHS['citadel'].path,
      children: citadelChildren,
    },
    crucible: {
      path: CORE_APP_PATHS['crucible'].path,
      children: crucibleChildren,
    },
    forge: {
      path: CORE_APP_PATHS['forge'].path,
      children: dreamforgeChildren,
    },
    gateway: {
      path: CORE_APP_PATHS['gateway'].path,
      children: gatewayChildren,
    },
    nexus: {
      path: CORE_APP_PATHS['nexus'].path,
      children: nexusChildren,
    },
    sentinel: {
      path: CORE_APP_PATHS['sentinel'].path,
      children: sentinelChildren,
    },
    vortex: {
      path: CORE_APP_PATHS['vortex'].path,
      children: vortexChildren,
    },
  };
}
