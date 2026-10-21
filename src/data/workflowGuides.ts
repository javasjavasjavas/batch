import type { HelpArticle } from '../types/content';

export const WORKFLOW_GUIDES: HelpArticle[] = [
  {
    slug: 'resize-product-photos-without-cropping', title: 'How to resize product photos without cropping', category: 'Product photos', readTime: '3 min read',
    summary: 'Make product photos the same size while keeping the whole product visible. Compare fit, crop and padding, then export a consistent batch.',
    sections: [
      { id: 'choose-fit', heading: 'Choose between a size limit and an exact frame', paragraphs: ['A maximum size and an exact size solve different problems. A 2400 × 1600 landscape photo fitted inside a 1600 × 1600 box becomes 1600 × 1067. It fits the limit, but it is not square. A portrait photo ends up with a different height and width.', 'For a catalog that requires every file to be square, use an exact frame and padding. The complete product stays visible while empty space fills the remaining area. Crop to fill also creates an exact frame, but cuts away the edges.'] },
      { id: 'prepare-batch', heading: 'Set up a batch of square product images', paragraphs: ['Open the bulk image resizer and add your original product photos. Set the target dimensions, for example 1600 × 1600 pixels, then choose the exact-size padding option. Pick a background that suits the destination.', 'Check the preview of both a wide and a tall product. The same frame does not guarantee the same apparent product size: whitespace already present in the original image affects the result. Use a platform kit with individual crop controls if each photo needs its own framing.'], list: ['Start with original, high-resolution images.', 'Choose padding to preserve the complete product.', 'Keep enlargement off when small originals should not be upscaled.', 'Review every planned size before processing.'] },
      { id: 'export', heading: 'Choose a format and download the result', paragraphs: ['For a website, compare JPG and WebP at a moderate quality setting. Use PNG when you need lossless output or transparency. JPG cannot preserve a transparent background; transparent pixels are filled with your selected color.', 'Download the processed files together in a ZIP. Batch creates new files and leaves your originals unchanged. Open a few exports at their intended display size before replacing images in your store.'] },
    ],
  },
  {
    slug: 'reduce-image-file-size', title: 'How to reduce image file size for uploads', category: 'Compression', readTime: '3 min read',
    summary: 'Reduce image file sizes by adjusting dimensions, quality and format. Learn why PNG behaves differently and how to check an upload limit.',
    sections: [
      { id: 'pixels-vs-bytes', heading: 'Separate pixel dimensions from file size', paragraphs: ['Pixel dimensions describe the image frame; file size describes how many bytes the encoded file uses. Two images with the same dimensions can have very different file sizes because texture, transparency, format and quality all matter.', 'If the destination only displays an image at a modest width, resizing an oversized original may save more space than lowering quality alone. Keep your original file and make changes to an export copy.'] },
      { id: 'compress', heading: 'Compress a batch and inspect the actual result', paragraphs: ['Open the image compressor, add still images and start with a moderate quality setting. Review the plan, run the batch and compare the resulting byte sizes. Look at edges, small text and detailed textures before reducing quality again.', 'Batch does not guarantee an exact target such as 100 KB or 1 MB. If a destination has a strict limit, check each downloaded file. Reduce dimensions or quality and reprocess the original when a file is still too large.'], list: ['Reduce unnecessary pixel dimensions first.', 'Compare JPG or lossy WebP quality settings for photos.', 'Inspect output size and appearance for every important image.', 'Avoid repeatedly compressing an already compressed export.'] },
      { id: 'png', heading: 'Why the quality slider does not shrink PNG the same way', paragraphs: ['PNG is lossless, so a JPG-style quality slider does not remove detail from it. PNG compression settings can change how efficiently pixels are stored, but a detailed photograph may still be large.', 'Try WebP when the destination supports it, especially if you need transparency. JPG is another option for photos with an opaque background. Some images are already efficiently encoded, and converting or recompressing them can produce a larger file. Compare the actual exports instead of assuming every conversion will save space.'] },
    ],
  },
  {
    slug: 'convert-webp-png-jpg', title: 'Convert WebP, PNG and JPG: choose the right format', category: 'Image formats', readTime: '3 min read',
    summary: 'Convert WebP to JPG, PNG to WebP or JPG to PNG in a batch. Understand transparency, lossless output and the limits of format conversion.',
    sections: [
      { id: 'webp-to-jpg', heading: 'WebP to JPG for compatible uploads', paragraphs: ['If an upload form accepts JPG but rejects WebP, open the image converter and choose JPG as the output format. Use a quality setting appropriate for the image and choose a fill color for transparent pixels.', 'JPG is a lossy format. Converting a WebP file to JPG may increase file size or introduce additional compression artifacts. Use the original source when available, and inspect small lettering and high-contrast edges after export.'] },
      { id: 'png-to-webp', heading: 'PNG to WebP for web images', paragraphs: ['Choose WebP to compare smaller web-friendly exports with your PNG originals. Lossless WebP preserves pixel detail; lossy WebP trades some detail for a smaller file. Both can support transparency.', 'The best choice depends on the content and where it will be used. A flat illustration, a photograph and a screenshot may each respond differently. Check the receiving app or website accepts WebP before converting a whole library.'] },
      { id: 'jpg-to-png', heading: 'JPG to PNG does not restore lost detail', paragraphs: ['Converting JPG to PNG changes the format but cannot recover detail already removed by JPEG compression. The PNG output can be much larger. Use it when a destination specifically requires PNG or a later workflow needs a lossless intermediate file.', 'Conversion also does not remove a background or create transparency from an opaque photo. Background removal is a separate operation available in supported platform workflows.'] },
      { id: 'batch-conversion', heading: 'Convert multiple images with one output setting', paragraphs: ['Add supported still images, select one output format and review the planned filenames. Run the batch and download the results individually or in a ZIP. Mixed input formats can share the same output setting.', 'Animated image transformations are blocked to preserve their frames; animated files can be renamed unchanged. HEIC, TIFF, SVG and RAW are not supported inputs. AVIF input depends on browser decoding support. Your files are processed locally and originals remain unchanged.'] },
    ],
  },
];

export const GUIDE_TOOLS: Record<string, string[]> = {
  'resize-product-photos-without-cropping': ['bulk-image-resizer', 'shopify-assets', 'etsy-assets'],
  'reduce-image-file-size': ['image-compressor', 'bulk-image-resizer', 'image-converter'],
  'convert-webp-png-jpg': ['image-converter', 'image-compressor'],
};
