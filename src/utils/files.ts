import { LIMITS } from '../processing/formats';

export const SUPPORTED_FORMATS_LABEL = 'JPG, PNG, WebP, GIF, AVIF';
export const ACCEPT_ATTR =
'image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif';

/** Returns a human-readable reason when a file can't be previewed, or null when supported. */
export function checkFile(file: File): string | null {
  if (!file.size) return 'This file is empty.';
  if (file.size > LIMITS.fileBytes) return 'This file exceeds the 40 MB limit.';
  return null; // Unknown extensions are inspected by content after intake.
}

export function readImageDimensions(url: string): Promise<{width: number;height: number;}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0) resolve({ width: img.naturalWidth, height: img.naturalHeight });else
      reject(new Error('Empty image'));
    };
    img.onerror = () => reject(new Error('Unreadable image'));
    img.src = url;
  });
}

export function makeId(prefix = 'img'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
