import { ArrowRightIcon } from 'lucide-react';
import { SAMPLE_IMAGES } from '../../data/sampleImages';
import { ImageThumb } from '../ui/ImageThumb';

const PICKS = ['sample-sneaker', 'sample-headphones', 'sample-bottle', 'sample-jar'];
const items = PICKS.map((id) => SAMPLE_IMAGES.find((i) => i.id === id)).filter(
  (i): i is (typeof SAMPLE_IMAGES)[number] => Boolean(i)
);

/** Illustration of a planned batch: mixed originals on the left, one consistent output plan on the right. */
export function BatchShowcase() {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
      <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
        <div>
          <p className="text-sm font-semibold text-ink">Before</p>
          <p className="text-[13px] text-muted">4 images, 4 different sizes</p>
          <div className="mt-4 grid grid-cols-2 items-end gap-3">
            {items.map((img) =>
            <div key={img.id}>
                <div className="overflow-hidden rounded-lg" style={{ aspectRatio: `${img.width} / ${img.height}` }}>
                  <ImageThumb src={img.url} alt={img.name} fit="cover" eager />
                </div>
                <p className="tabular mt-1.5 text-[12px] text-muted">
                  {img.width} × {img.height}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center" aria-hidden="true">
          <span className="flex h-9 w-9 rotate-90 items-center justify-center rounded-full border border-line bg-canvas text-ink sm:rotate-0">
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
        <div className="sm:border-l sm:border-line sm:pl-5">
          <p className="text-sm font-semibold text-ink">After</p>
          <p className="text-[13px] text-muted">Square 1600 × 1600, WebP</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {items.map((img, i) =>
            <div key={img.id}>
                <div className="aspect-square overflow-hidden rounded-lg border border-line bg-[#ECEAE3] p-2">
                  <ImageThumb src={img.url} alt="" fit="contain" className="bg-transparent" eager />
                </div>
                <p className="tabular mt-1.5 truncate text-[12px] text-muted">product-00{i + 1}.webp</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <figcaption className="mt-auto border-t border-line pt-3 text-[12px] text-muted">
        Illustration of a planned batch using the sample set.
      </figcaption>
    </figure>);

}
