/**
 * Utility to disable all animations for e-ink display optimization.
 * E-ink screens suffer from ghosting with smooth transitions,
 * so all animations must be immediate and discrete.
 */

import { Platform } from 'react-native';

/**
 * Disables animations globally for the app.
 * Call once during app initialization.
 */
export function disableAnimations(): void {
  // Web: disable CSS transitions globally
  if (Platform.OS === 'web') {
    try {
      const style = document.createElement('style');
      style.setAttribute('data-boox-disable-animations', 'true');
      style.textContent = `
        *, *::before, *::after {
          transition: none !important;
          -webkit-transition: none !important;
          -moz-transition: none !important;
          animation: none !important;
          -webkit-animation: none !important;
        }
      `;
      document.head.appendChild(style);
    } catch {
      // Non-critical
    }
  }
}

/**
 * Creates a platform-appropriate animation config.
 * Always returns no animation for e-ink optimization.
 */
export const ANIMATION_CONFIG = {
  none: {
    duration: 0,
    animationDuration: 0,
    animationEnabled: false,
    useNativeDriver: false,
  },
} as const;

/**
 * HOC to wrap a component and disable its animations.
 * Usage: const NoAnimButton = withNoAnimations(Button);
 */
export function withNoAnimations<T extends Record<string, any>>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return Component; // No-op wrapper; animations should be disabled declaratively
}

/**
 * Forces a layout recalculation, useful after animations are disabled
 * to ensure the UI renders immediately.
 */
export function forceLayout(rootTag: number): void {
  if (Platform.OS === 'web') {
    document?.body?.offsetHeight; // Force reflow
  }
}