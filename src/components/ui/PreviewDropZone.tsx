import { useRef, useState, type ReactNode } from 'react';
import { ImagePlusIcon } from 'lucide-react';
import { useI18n } from '../../i18n/LocaleContext';

/** The preview and file chooser share the same loader and validation. */
export function PreviewDropZone({ children, onFiles, onChoose, disabled, busy, single, hasImage, className = '' }: {
  children: ReactNode;
  onFiles: (files: File[]) => void;
  onChoose: () => void;
  disabled: boolean;
  busy: boolean;
  single: boolean;
  hasImage: boolean;
  className?: string;
}) {
  const { locale } = useI18n();
  const depth = useRef(0);
  const [over, setOver] = useState(false);
  const es = locale === 'es';
  const hint = single
    ? es ? (hasImage ? 'Soltá otra imagen para reemplazarla o hacé clic' : 'Arrastrá una imagen aquí o hacé clic para elegir') : (hasImage ? 'Drop another image to replace it, or click to browse' : 'Drop an image here or click to browse')
    : es ? 'Arrastrá imágenes aquí o hacé clic para agregar' : 'Drop images here or click to add';
  return <div className={`studio-preview preview-dropzone ${className} ${over && !disabled ? 'is-dragging' : ''}`} role="button" tabIndex={disabled ? -1 : 0} aria-label={hint} aria-disabled={disabled} aria-busy={busy}
    onClick={() => { if (!disabled) onChoose(); }}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!disabled) onChoose(); } }}
    onDragEnter={e => { if (!e.dataTransfer.types.includes('Files')) return; e.preventDefault(); e.stopPropagation(); depth.current++; if (!disabled) setOver(true); }}
    onDragOver={e => { if (!e.dataTransfer.types.includes('Files')) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = disabled ? 'none' : 'copy'; }}
    onDragLeave={e => { e.preventDefault(); e.stopPropagation(); depth.current = Math.max(0, depth.current - 1); if (!depth.current) setOver(false); }}
    onDrop={e => { e.preventDefault(); e.stopPropagation(); depth.current = 0; setOver(false); if (disabled) return; const files = Array.from(e.dataTransfer.files); if (files.length) onFiles(single ? files.slice(0, 1) : files); }}>
    {children}
    <span className="preview-drop-hint"><ImagePlusIcon size={16} aria-hidden="true" />{hint}</span>
    {over && !disabled && <span className="preview-drop-overlay"><ImagePlusIcon size={36} aria-hidden="true" /><span>{es ? 'Soltá para cargar' : 'Drop to upload'}</span></span>}
  </div>;
}
