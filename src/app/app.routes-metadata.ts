import { AppRouteMap } from './app.routes-models';

export const CORE_APP_METADATA: AppRouteMap = {
  dreamforge: {
    title: 'Dreamforge',
    description:
      'Creative hub focused on crafting, managing, and refining tasks. Includes tools for task creation and specialization.',
    icon: 'build',
    altName: 'Creator',
  },
  sentinel: {
    title: 'Sentinel',
    description:
      'Strategic command center for overseeing, prioritizing, and managing tasks at a high level.',
    icon: 'security',
    altName: 'Task Lists',
  },
  nexus: {
    title: 'Nexus',
    description:
      'Central hub for organizing and planning tasks, focusing on workflow management and time-based sessions.',
    icon: 'hub',
    altName: 'Time Management',
  },
  vortex: {
    title: 'Vortex',
    description:
      'Visualization center for tasks, offering dynamic and interactive visual representations.',
    icon: 'donut_large',
    altName: 'Visualizer',
  },
  crucible: {
    title: 'Crucible',
    description:
      'A focused area for refining and executing group actions on selected tasks.',
    icon: 'filter_list',
    altName: 'Mass Process',
  },
  citadel: {
    title: 'Citadel',
    description:
      'Fortified hub for essential task management utilities, such as cleaning and importing/exporting tasks.',
    icon: 'shield',
    altName: 'Utilities',
  },
  gateway: {
    title: 'Gateway',
    description:
      'The entry point to the application, managing user login, initial navigation, and settings.',
    icon: 'login',
    altName: 'Home',
  },
};
