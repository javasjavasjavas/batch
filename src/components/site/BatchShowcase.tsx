import { ArrowRightIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SAMPLE_IMAGES } from '../../data/sampleImages';
import { extendGradient } from '../../processing/gradient';
import { ImageThumb } from '../ui/ImageThumb';

const PICKS = ['sample-sneaker', 'sample-headphones', 'sample-bottle', 'sample-jar', 'sample-serum', 'sample-mug'];
const items = PICKS.map((id) => SAMPLE_IMAGES.find((i) => i.id === id)).filter(
  (i): i is (typeof SAMPLE_IMAGES)[number] => Boolean(i)
);

/** Use the same background extension as the workspace, keeping the entire product visible. */
function SquarePreview({ src }: { src: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const scale = 320 / Math.max(image.naturalWidth, image.naturalHeight);
      const width = Math.round(image.naturalWidth * scale);
      const height = Math.round(image.naturalHeight * scale);
      const sample = document.createElement('canvas');
      sample.width = width;
      sample.height = height;
      const sampleCtx = sample.getContext('2d');
      if (!sampleCtx) return;
      sampleCtx.drawImage(image, 0, 0, width, height);
      const x = (320 - width) / 2, y = (320 - height) / 2;
      ctx.putImageData(extendGradient(sampleCtx.getImageData(0, 0, width, height), 320, 320, x, y, width, height), 0, 0);
      ctx.drawImage(image, x, y, width, height);
      setPreview(canvas.toDataURL('image/webp', 0.9));
    };
    image.src = src;
    return () => { cancelled = true; };
  }, [src]);
  return <ImageThumb src={preview ?? src} alt="" fit="contain" eager />;
}

/** Illustration of a planned batch: mixed originals on the left, one consistent output plan on the right. */
export function BatchShowcase() {
  return (
    <figure className="batch-showcase rounded-2xl border border-line bg-white shadow-soft">
      <div className="batch-showcase-layout">
        <div className="batch-showcase-column">
          <div className="batch-showcase-heading">
            <p className="batch-showcase-title">Before</p>
            <p className="batch-showcase-subtitle">{items.length} images · mixed sizes</p>
          </div>
          <div className="batch-showcase-images">
            {items.map((img) =>
            <div key={img.id} className="min-w-0">
                <div className="batch-showcase-image-stage">
                  <div
                    className="overflow-hidden rounded-lg"
                    style={{
                      aspectRatio: `${img.width} / ${img.height}`,
                      width: img.width >= img.height ? '100%' : `${img.width / img.height * 100}%`,
                    }}>
                    <ImageThumb src={img.url} alt={img.name} fit="cover" eager />
                  </div>
                </div>
                <p className="batch-showcase-caption tabular">
                  {img.width} × {img.height}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="batch-showcase-divider" aria-hidden="true">
          <span className="batch-showcase-arrow">
            <ArrowRightIcon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        </div>
        <div className="batch-showcase-column">
          <div className="batch-showcase-heading">
            <div className="flex items-center gap-3">
              <p className="batch-showcase-title">After</p>
              <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-medium leading-none text-ink">Ready</span>
            </div>
            <p className="batch-showcase-subtitle">1600 × 1600 · WebP</p>
          </div>
          <div className="batch-showcase-images">
            {items.map((img, i) =>
            <div key={img.id} className="min-w-0">
                <div className="aspect-square overflow-hidden rounded-lg bg-[#ECEAE3]">
                  <SquarePreview src={img.url} />
                </div>
                <p className="batch-showcase-caption tabular">product-00{i + 1}.webp</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        Sample batch illustration: six images with mixed dimensions become six square WebP images with consistent names.
      </figcaption>
    </figure>);

}
