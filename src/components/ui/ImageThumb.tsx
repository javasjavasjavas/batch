import { useI18n } from '../../i18n/LocaleContext';
import { useEffect, useState } from 'react';
import { ImageOffIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ImageThumbProps {
  src: string | null;
  alt: string;
  fit?: 'contain' | 'cover';
  className?: string;
  showLabel?: boolean;
  eager?: boolean;
}

export function ImageThumb({ src, alt, fit = 'contain', className, showLabel = false, eager = false }: ImageThumbProps) {
  const { tr } = useI18n();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);

  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={tr(`${alt}: preview unavailable`)}
        className={twMerge('flex h-full w-full flex-col items-center justify-center gap-1.5 bg-sunken text-muted', className)}>
        
        <ImageOffIcon className="h-5 w-5" aria-hidden="true" />
        {showLabel && <span className="px-2 text-center text-xs">{tr("Preview unavailable")}</span>}
      </div>);

  }

  return (
    <div className={twMerge('relative h-full w-full bg-sunken', className)}>

      <img
        src={src}
        alt={tr(alt)}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        className={twMerge(
          'h-full w-full transition-opacity duration-200 ease-out',
          fit === 'contain' ? 'object-contain' : 'object-cover',
          'opacity-100'
        )} />
      
    </div>);

}