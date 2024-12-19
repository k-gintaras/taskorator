import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { HorizontalNavigationComponent } from './horizontal-navigation.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NavigationBuilderService } from '../../services/navigation-builder.service';
import { OverlordNavigatorComponent } from '../overlord-navigator/overlord-navigator.component';
import { of } from 'rxjs';

// Mock Services
class MockNavigationBuilderService {
  getTopLevelFeatures() {
    return [
      { path: 'Plagiatus', metadata: { title: 'Plagiatus 1' } },
      { path: 'Culminatus', metadata: { title: 'Culminatus 2' } },
    ];
  }

  getChildrenPaths(path: string) {
    if (path === 'feature1') {
      return ['child1', 'child2'];
    }
    return [];
  }

  getRouteMetadata(path: string) {
    return { title: `Child of ${path}` };
  }
}

class MockBreakpointObserver {
  observe() {
    return of({ matches: false });
  }
}

export default {
  title: 'Components/Horizontal Navigation',
  component: HorizontalNavigationComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule, // Required for Angular animations
        RouterTestingModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        OverlordNavigatorComponent,
      ],
      providers: [
        {
          provide: NavigationBuilderService,
          useClass: MockNavigationBuilderService,
        },
        { provide: BreakpointObserver, useClass: MockBreakpointObserver },
      ],
    }),
  ],
} as Meta<HorizontalNavigationComponent>;

const Template: StoryFn<HorizontalNavigationComponent> = (
  args: Partial<HorizontalNavigationComponent>
) => ({
  props: args,
});

export const Default = Template.bind({});
Default.args = {
  isHandset: false,
};
