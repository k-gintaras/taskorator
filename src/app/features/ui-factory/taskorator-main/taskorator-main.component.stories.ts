// taskorator-main.stories.ts
import { Meta, StoryFn, moduleMetadata } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { TaskoratorMainComponent } from './taskorator-main.component';

export default {
  title: 'Taskorator/Main UI',
  component: TaskoratorMainComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        BrowserAnimationsModule, // ✅ Required for animations
        TaskoratorMainComponent, // ✅ Standalone import
      ],
    }),
  ],
} as Meta<TaskoratorMainComponent>;

const Template: StoryFn = () => ({
  props: {},
});

export const Default = Template.bind({});
