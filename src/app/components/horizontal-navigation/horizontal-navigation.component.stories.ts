// import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
// import { RouterTestingModule } from '@angular/router/testing';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { BreakpointObserver } from '@angular/cdk/layout';
// import { NavigationBuilderService } from '../../services/navigation-builder.service';
// import { OverlordNavigatorComponent } from '../overlord-navigator/overlord-navigator.component';
// import { of } from 'rxjs';
// import { OverlordNavigatorComponentTest } from '../overlord-navigator/overlord-navigator-test.component';
// import { HorizontalNavigationComponentTest } from './horizontal-navigation-test/horizontal-navigation-test.component';

// class MockNavigationBuilderService {
//   getTopLevelFeatures() {
//     return [
//       { path: 'sentinel', metadata: { title: 'Sentinel', icon: 'shield' } },
//     ];
//   }

//   getChildrenPaths(path: string) {
//     if (path === 'sentinel') {
//       return ['latestCreated', 'latestUpdated', 'dailyTasks'];
//     }
//     return [];
//   }

//   getRouteMetadata(path: string) {
//     return (
//       {
//         sentinel: { title: 'Sentinel', icon: 'shield' },
//         latestCreated: { title: 'Latest Created Tasks', icon: 'task_alt' },
//         latestUpdated: { title: 'Latest Updated Tasks', icon: 'update' },
//         dailyTasks: { title: 'Daily Tasks', icon: 'today' },
//       }[path] || { title: 'Unnamed Route', icon: 'help' }
//     );
//   }
// }

// class MockBreakpointObserver {
//   observe() {
//     return of({ matches: true });
//   }
// }

// export default {
//   title: 'Components/Horizontal Navigation',
//   component: HorizontalNavigationComponentTest,
//   decorators: [
//     moduleMetadata({
//       imports: [
//         BrowserAnimationsModule, // Required for Angular animations
//         RouterTestingModule,
//         MatSidenavModule,
//         MatToolbarModule,
//         MatIconModule,
//         MatButtonModule,
//         OverlordNavigatorComponentTest,
//       ],
//       providers: [
//         {
//           provide: NavigationBuilderService,
//           useClass: MockNavigationBuilderService,
//         },
//         { provide: BreakpointObserver, useClass: MockBreakpointObserver },
//       ],
//     }),
//   ],
// } as Meta<HorizontalNavigationComponentTest>;

// const Template: StoryFn<HorizontalNavigationComponentTest> = (
//   args: Partial<HorizontalNavigationComponentTest>
// ) => ({
//   props: args,
// });

// export const Default = Template.bind({});
// Default.args = {
//   isHandset: false,
// };
