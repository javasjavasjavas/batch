import type { HelpArticle } from '../types/content';

// Shared summaries stay small; article bodies load only on guide routes.
export const ARTICLE_META: Record<string, Omit<HelpArticle, 'sections'>> = {
  "resize-product-photos-without-cropping": {
    "slug": "resize-product-photos-without-cropping",
    "title": "How to resize product photos without cropping",
    "category": "Product photos",
    "readTime": "3 min read",
    "summary": "Make product photos the same size while keeping the whole product visible. Compare fit, crop and padding, then export a consistent batch."
  },
  "reduce-image-file-size": {
    "slug": "reduce-image-file-size",
    "title": "How to reduce image file size for uploads",
    "category": "Compression",
    "readTime": "3 min read",
    "summary": "Reduce image file sizes by adjusting dimensions, quality and format. Learn why PNG behaves differently and how to check an upload limit."
  },
  "convert-webp-png-jpg": {
    "slug": "convert-webp-png-jpg",
    "title": "Convert WebP, PNG and JPG: choose the right format",
    "category": "Image formats",
    "readTime": "3 min read",
    "summary": "Convert WebP to JPG, PNG to WebP or JPG to PNG in a batch. Understand transparency, lossless output and the limits of format conversion."
  },
  "getting-started-with-a-batch": {
    "slug": "getting-started-with-a-batch",
    "title": "Getting started with a batch",
    "summary": "Add images, choose what should happen to them, and review the plan before running.",
    "category": "Getting started",
    "readTime": "3 min read"
  },
  "choosing-output-settings": {
    "slug": "choosing-output-settings",
    "title": "Choosing output settings",
    "summary": "Practical defaults for size, quality, format, and naming, and when to change them.",
    "category": "Output settings",
    "readTime": "4 min read"
  },
  "local-processing-and-browser-limits": {
    "slug": "local-processing-and-browser-limits",
    "title": "Understanding local processing and browser limits",
    "summary": "How Batch is designed to work on your device, and what that means for large batches.",
    "category": "Local processing",
    "readTime": "3 min read"
  },
  'image-seo-filenames-alt-text': {
  "slug": "image-seo-filenames-alt-text",
  "title": "Image SEO: filenames, alt text and export settings",
  "summary": "Prepare website images with readable filenames, sensible dimensions and the right format. Learn what to set in Batch and what to add in your website editor.",
  "category": "Website images",
  "readTime": "3 min read"
}
};
