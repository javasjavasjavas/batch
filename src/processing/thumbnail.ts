export async function makeThumbnail(file: File, width: number, height: number): Promise<string> {
  const scale = Math.min(1, 320 / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image', resizeWidth: targetWidth, resizeHeight: targetHeight, resizeQuality: 'high' });
  try {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth; canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Thumbnail canvas unavailable.');
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Thumbnail creation failed.')), 'image/webp', 0.75));
    return URL.createObjectURL(blob);
  } finally { bitmap.close(); }
}
