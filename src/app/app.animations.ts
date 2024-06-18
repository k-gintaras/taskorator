import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const highlightRecentlyModifiedTask = trigger('highlightTask', [
  state(
    'normal',
    style({
      backgroundColor: 'transparent',
    })
  ),
  state(
    'highlighted',
    style({
      backgroundColor: '#FFFF99', // Highlight color, adjust as needed
    })
  ),
  transition('normal <=> highlighted', [animate('1.5s')]),
]);
