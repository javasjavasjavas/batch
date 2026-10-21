import type { ArticleSection } from '../types/content';

type Screenshot = NonNullable<ArticleSection['image']>;
const shot = (file: string, width: number, height: number, alt: string, caption: string): Screenshot => ({ src: `/guides/${file}.jpg`, width, height, alt, caption });

// Cropped from the running application using bundled sample photos, 2026-10-21.
const images = {
  results: shot('batch-results', 740, 300, 'Completed WebP files showing original and exported byte sizes with Compare buttons', 'Compare the actual output sizes and inspect the images. This sample combines resizing, quality 75 and WebP conversion; savings vary by image and settings.'),
  intake: shot('add-images', 650, 405, 'Workspace dropzone with Choose images and Try a sample batch buttons', 'Start with Choose images, drag files into the dropzone, or explore the bundled sample batch.'),
  organize: shot('organize-batch', 885, 309, 'Image grid with selection checkboxes, filenames, dimensions and Add images controls', 'The image grid shows your originals. Use the toolbar to switch views, add files or select images.'),
  resize: shot('resize-padding', 328, 419, 'Resize settings with 1600 by 1600 pixels, proportions unlocked and Pad to fit selected', 'Example: unlock proportions, enter 1600 × 1600 pixels and select Pad to fit to keep the whole product.'),
  compress: shot('compress-quality', 328, 300, 'Compression quality at 75 with Balanced selected and a recommended quality note', 'Start with a moderate quality setting for JPG or WebP, then inspect the exported file size and detail.'),
  convert: shot('convert-format', 328, 261, 'Output format choices for WebP, JPG and PNG with WebP selected', 'Choose the format the destination accepts. WebP and PNG can keep transparency; JPG needs a solid background.'),
  rename: shot('rename-pattern', 328, 258, 'Rename pattern product-{n} with number, original name and date placeholders', 'The pattern product-{n} adds a sequence number. Preview planned filenames before processing.'),
  background: shot('background-options', 328, 405, 'Resize background options with Replace background AI selected and its local model download notice', 'Extend gradient fills a simple background; the AI options isolate the product. Review edges and shadows after processing.'),
  review: shot('review-batch', 722, 357, 'Review list comparing original product photos with planned WebP filenames and 1600 by 1600 dimensions', 'Review shows planned names, dimensions and formats before any images are processed.'),
};

export const GUIDE_SCREENSHOTS: Record<string, Record<string, Screenshot>> = {
  'getting-started-with-a-batch': { 'add-images': images.intake, organize: images.organize, 'choose-tools': images.compress, review: images.review },
  'choosing-output-settings': { size: images.resize, quality: images.compress, format: images.convert, naming: images.rename },
  'local-processing-and-browser-limits': { backgrounds: images.background },
  'resize-product-photos-without-cropping': { 'prepare-batch': images.resize, export: images.results },
  'reduce-image-file-size': { 'pixels-vs-bytes': images.results, compress: images.compress, png: images.convert },
  'convert-webp-png-jpg': { 'webp-to-jpg': { ...images.convert, caption: 'Select JPG when an upload requires it. The screenshot shows all three output choices; the example selection is WebP.' }, 'batch-conversion': images.review },
};
