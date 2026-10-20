export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes)) return 'Size unavailable';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

export function formatDimensions(width: number | null, height: number | null): string | null {
  if (!width || !height) return null;
  return `${width} × ${height}`;
}

export function getExtension(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toLowerCase() : '';
}

export function stripExtension(name: string): string {
  return name.replace(/\.[^./\\]+$/, '');
}

export function normalizeExtension(ext: string): string {
  if (ext === 'jpeg' || ext === 'jfif') return 'jpg';
  return ext;
}

export function formatTypeLabel(type: string, name: string): string {
  const ext = normalizeExtension(getExtension(name));
  if (ext) return ext === 'webp' ? 'WebP' : ext.toUpperCase();
  if (type.startsWith('image/')) return type.slice(6).toUpperCase();
  return 'Unknown';
}

export function formatDate(timestamp: number | null): string | null {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function pluralize(count: number, word: string, plural = `${word}s`): string {
  return `${count} ${count === 1 ? word : plural}`;
}

export function slugify(value: string): string {
  return (
    value.
    toLowerCase().
    trim().
    replace(/[^a-z0-9]+/g, '-').
    replace(/^-+|-+$/g, '') || 'batch');

}