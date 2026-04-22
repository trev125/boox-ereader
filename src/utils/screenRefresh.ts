/**
 * Screen refresh utilities for e-ink displays.
 * Triggers full screen flashes to clear ghosting artifacts.
 */

/**
 * Triggers a white screen flash to clear ghosting on e-ink displays.
 * This is the primary method for screen clearance on Boox devices.
 */
export async function screenRefresh(): Promise<void> {
  // Method 1: Use document.body style for white flash
  const whiteFlash = async () => {
    // Flash white
    document.body.style.backgroundColor = '#FFFFFF';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';

    // Brief delay for visual
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Flash black
    document.body.style.backgroundColor = '#000000';

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Flash white again
    document.body.style.backgroundColor = '#FFFFFF';

    await new Promise((resolve) => setTimeout(resolve, 200));

    // Restore background
    document.body.style.backgroundColor = '';

    // Trigger a full repaint
    if (document.documentElement) {
      document.documentElement.style.setProperty('opacity', '0.99');
      document.documentElement.style.setProperty('opacity', '1');
    }
  };

  // Method 2: Try to use Boox-specific API if available
  const booxRefresh = async () => {
    // Check for Boox API availability
    // @ts-expect-error Boox API may not be typed
    if (window.Android && window.Android.WebView) {
      try {
        // @ts-expect-error Boox API may not be typed
        if (window.Android.forceFullScreenUpdate) {
          // @ts-expect-error Boox API may not be typed
          await window.Android.forceFullScreenUpdate();
          return;
        }
      } catch {
        // Fall back to software refresh
      }
    }

    // Method 3: Use canvas to force repaint
    try {
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        document.body.appendChild(canvas);
        document.body.removeChild(canvas);
      }
    } catch {
      // Canvas method failed, already fell back
    }
  };

  // Execute both methods
  try {
    await whiteFlash();
    await booxRefresh();
  } catch {
    // If everything fails, at least try the basic flash again
    document.body.style.backgroundColor = '#FFFFFF';
    setTimeout(() => {
      document.body.style.backgroundColor = '';
    }, 300);
  }
}

/**
 * Triggers a black-to-white flash sequence.
 * Useful for clearing specific types of ghosting.
 */
export async function blackToWhiteFlash(): Promise<void> {
  const steps = ['#000000', '#FFFFFF'];

  for (const color of steps) {
    document.body.style.backgroundColor = color;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  document.body.style.backgroundColor = '';
}

/**
 * Triggers a white-to-black flash sequence.
 * Alternative ghosting clearance method.
 */
export async function whiteToBlackFlash(): Promise<void> {
  const steps = ['#FFFFFF', '#000000'];

  for (const color of steps) {
    document.body.style.backgroundColor = color;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  document.body.style.backgroundColor = '';
}

/**
 * Performs a full screen refresh cycle with all methods.
 * This is the most thorough ghosting clearance available.
 */
export async function fullScreenRefreshCycle(): Promise<void> {
  // White flash
  await screenRefresh();
  // Black to white
  await blackToWhiteFlash();
  // White to black
  await whiteToBlackFlash();
  // Final white flash
  await screenRefresh();
}