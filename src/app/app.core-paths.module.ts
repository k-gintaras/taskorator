import { NgModule } from '@angular/core';
import { Route } from '@angular/router';
import { canActivate, canActivateChild } from './services/core/auth-guard';

export interface AppRoute extends Route {
  path: string; // Ensure path is required
  title: string;
  altName?: string;
  description: string;
  icon: string;
  children?: AppRoute[]; // Children should be an array of AppRoute
}

export interface RouteMetadata {
  title: string;
  altName?: string;
  description: string;
  icon: string;
}

export interface AppRouteMap {
  [key: string]: AppRoute;
}

export const CORE_APP_PATHS: AppRouteMap = {
  forge: {
    path: 'forge',
    title: 'Dreamforge',
    description:
      'Creative hub focused on crafting, managing, and refining tasks. Includes tools for task creation and specialization.',
    icon: 'build',
    altName: 'Creator',

    loadChildren: () =>
      import('./features/core/dreamforge/dreamforge.module').then(
        (m) => m.DreamforgeModule
      ),
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
    // Comment: Dreamforge is where users create and refine their tasks, using creative and specialized tools.
  },
  sentinel: {
    path: 'sentinel',
    title: 'Sentinel',
    description:
      'Strategic command center for overseeing, prioritizing, and managing tasks at a high level.',
    icon: 'security',
    altName: 'Command',
    loadChildren: () =>
      import('./features/core/sentinel/sentinel.module').then(
        (m) => m.SentinelModule
      ),
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
    // Comment: Sentinel acts as the strategic hub, providing an overview of tasks and helping prioritize them effectively.
  },
  nexus: {
    path: 'nexus',
    title: 'Nexus',
    description:
      'Central hub for organizing and planning tasks, focusing on workflow management and time-based sessions.',
    icon: 'hub',
    altName: 'Task Hub',
    loadChildren: () =>
      import('./features/core/nexus/nexus.module').then((m) => m.NexusModule),
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
    // Comment: Nexus is the planning center, where users can manage workflows and organize tasks over time.
  },
  vortex: {
    path: 'vortex',
    title: 'Vortex',
    description:
      'Visualization center for tasks, offering dynamic and interactive visual representations.',
    icon: 'donut_large',
    altName: 'Visualizer',
    loadChildren: () =>
      import('./features/core/vortex/vortex.module').then(
        (m) => m.VortexModule
      ),
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
    // Comment: Vortex provides a visual, interactive way to represent and manage tasks, making it easier to understand their relationships and progress.
  },
  crucible: {
    path: 'crucible',
    title: 'Crucible',
    description:
      'A focused area for refining and executing group actions on selected tasks.',
    icon: 'filter_list',
    altName: 'Task Batch',
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
    loadChildren: () =>
      import('./features/core/crucible/crucible.module').then(
        (m) => m.CrucibleModule
      ),
    // Comment: Crucible is where selected tasks are brought together for group actions and refinement, acting as a batch processing center.
  },
  citadel: {
    path: 'citadel',
    title: 'Citadel',
    description:
      'Fortified hub for essential task management utilities, such as cleaning and importing/exporting tasks.',
    icon: 'shield',
    altName: 'Utilities',
    canActivate: [canActivate],
    canActivateChild: [canActivateChild],
    loadChildren: () =>
      import('./features/core/citadel/citadel.module').then(
        (m) => m.CitadelModule
      ),
    // Comment: Citadel houses the essential tools for managing and maintaining tasks, ensuring they are clean, organized, and easily transferable.
  },
  gateway: {
    path: 'gateway',
    title: 'Gateway',
    description:
      'The entry point to the application, managing user login, initial navigation, and settings.',
    icon: 'login',
    altName: 'Home',
    loadChildren: () =>
      import('./features/core/gateway/gateway.module').then(
        (m) => m.GatewayModule
      ),
    // Comment: Gateway serves as the starting point for users, handling authentication, navigation, and configuration settings.
  },
};

@NgModule({
  providers: [],
})
export class AppAllPathsModule {}
