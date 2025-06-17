import { Injectable } from '@angular/core';
import { TaskNodeInfo } from '../../models/taskTree';

import { TaskoratorTask } from '../../models/taskModelManager';

@Injectable({ providedIn: 'root' })
export class ColorService {
  readonly defaultPalette = [
    210, // Jan - Winter Blue
    200, // Feb - Winter Blue (teal)
    120, // Mar - Spring Green
    140, // Apr - Spring Green (fresh)
    90, // May - Spring Yellow-Green
    60, // Jun - Summer Yellow
    50, // Jul - Summer Yellow (warm sun)
    30, // Aug - Late Summer Orange
    15, // Sep - Autumn Orange-Red
    10, // Oct - Autumn Red-Brown
    5, // Nov - Deep Autumn Red
    180, // Dec - Winter Cyan
  ];

  readonly MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days cap

  /**
   * Returns HSL color string based on task creation date and age fading.
   */
  getDateBasedColor(timestamp: number, palette = this.defaultPalette): string {
    const now = Date.now();
    const ageMs = now - timestamp;
    const ageRatio = Math.min(ageMs / this.MAX_AGE_MS, 1);

    const date = new Date(timestamp);
    const month = date.getMonth();
    const hue = palette[month];

    const saturation = +(80 - ageRatio * 50).toFixed(2);
    const lightness = +(35 + ageRatio * 40).toFixed(2);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Simple linear interpolation between green and gray based on age.
   */
  getAgeColor(
    task: TaskoratorTask,
    maxAgeMs = 365 * 24 * 60 * 60 * 1000
  ): string {
    const green = { r: 76, g: 175, b: 80 };
    const gray = { r: 153, g: 153, b: 153 };

    const ageMs = Date.now() - task.timeCreated;
    const ageRatio = Math.min(ageMs / maxAgeMs, 1);

    const r = Math.round(green.r + ageRatio * (gray.r - green.r));
    const g = Math.round(green.g + ageRatio * (gray.g - green.g));
    const b = Math.round(green.b + ageRatio * (gray.b - green.b));

    return `rgb(${r},${g},${b})`;
  }

  /**
   * Calculates progress % from TaskNodeInfo
   */
  getProgressPercent(node: TaskNodeInfo | null): number {
    if (!node || node.childrenCount === 0) return 0;
    return (node.completedChildrenCount / node.childrenCount) * 100;
  }
}
