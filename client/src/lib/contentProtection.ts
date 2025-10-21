/**
 * Content Protection Utilities
 * Prevents screenshots, screen recording, and right-click saving
 */

export function enableContentProtection() {
  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable drag and drop
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable text selection on protected content
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    if (target?.classList.contains('protected-content')) {
      e.preventDefault();
      return false;
    }
  });

  // Disable copy on protected content
  document.addEventListener('copy', (e) => {
    const target = e.target as HTMLElement;
    if (target?.closest('.protected-content')) {
      e.preventDefault();
      return false;
    }
  });

  // Disable keyboard shortcuts for screenshots and recording
  document.addEventListener('keydown', (e) => {
    // Disable Print Screen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      return false;
    }

    // Disable Shift+Print Screen
    if (e.shiftKey && e.key === 'PrintScreen') {
      e.preventDefault();
      return false;
    }

    // Disable Windows+Shift+S (Windows screenshot)
    if (e.metaKey && e.shiftKey && e.key === 's') {
      e.preventDefault();
      return false;
    }

    // Disable Cmd+Shift+3 (Mac screenshot)
    if (e.metaKey && e.shiftKey && e.key === '3') {
      e.preventDefault();
      return false;
    }

    // Disable Cmd+Shift+4 (Mac screenshot)
    if (e.metaKey && e.shiftKey && e.key === '4') {
      e.preventDefault();
      return false;
    }

    // Disable F12 (Developer tools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+I (Developer tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+J (Developer tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+C (Developer tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
  });

  // Detect screen recording attempts
  detectScreenRecording();

  // Disable inspect element
  disableInspectElement();
}

/**
 * Detect screen recording attempts
 */
function detectScreenRecording() {
  // Check for screen capture API
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
    navigator.mediaDevices.getDisplayMedia = async function(...args) {
      console.warn('Screen recording attempt detected');
      throw new Error('Screen recording is not allowed on this platform');
    };
  }
}

/**
 * Disable inspect element functionality
 */
function disableInspectElement() {
  // Disable right-click inspect
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Detect if DevTools is open
  let devtools = { open: false };
  const threshold = 160;

  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        console.warn('Developer tools detected - content protection enabled');
      }
    } else {
      devtools.open = false;
    }
  }, 500);
}

/**
 * Add watermark to image
 */
export async function addWatermarkToImage(
  imageUrl: string,
  creatorName: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(imageUrl);
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Add watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Add watermark text at multiple positions
      const positions = [
        { x: img.width / 2, y: img.height / 2 },
        { x: img.width / 4, y: img.height / 4 },
        { x: (img.width * 3) / 4, y: (img.height * 3) / 4 },
      ];

      positions.forEach(({ x, y }) => {
        ctx.fillText(`© ${creatorName}`, x, y);
      });

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = imageUrl;
  });
}

/**
 * Add watermark to video element
 */
export function addWatermarkToVideo(
  videoElement: HTMLVideoElement,
  creatorName: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return canvas;

  canvas.width = videoElement.videoWidth || 1280;
  canvas.height = videoElement.videoHeight || 720;

  // Draw video frame
  ctx.drawImage(videoElement, 0, 0);

  // Add watermark
  ctx.fillStyle = 'rgba(255, 102, 0, 0.3)'; // Oilers orange
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`© ${creatorName}`, canvas.width / 2, canvas.height / 2);

  // Add corner watermark
  ctx.font = 'bold 16px Arial';
  ctx.fillText(`© ${creatorName}`, canvas.width - 100, canvas.height - 20);

  return canvas;
}

/**
 * Disable download on protected content
 */
export function disableDownload(element: HTMLElement) {
  element.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
      e.preventDefault();
    }
  });
}

