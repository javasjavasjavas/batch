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
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt}: preview unavailable`}
        className={twMerge('flex h-full w-full flex-col items-center justify-center gap-1.5 bg-sunken text-muted', className)}>
        
        <ImageOffIcon className="h-5 w-5" aria-hidden="true" />
        {showLabel && <span className="px-2 text-center text-xs">Preview unavailable</span>}
      </div>);

  }

  return (
    <div className={twMerge('relative h-full w-full bg-sunken', className)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-[#E8E8E0]" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={twMerge(
          'h-full w-full transition-opacity duration-200 ease-out',
          fit === 'contain' ? 'object-contain' : 'object-cover',
          loaded ? 'opacity-100' : 'opacity-0'
        )} />
      
    </div>);

}