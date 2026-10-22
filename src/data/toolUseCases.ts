import type { ToolId } from '../types/batch';
export const TOOL_USE_CASES: Record<ToolId, {title:string;body:string;href:string;label:string}[]> = {
  "resize": [
    {
      "title": "Square product photos without cropping",
      "body": "Set both sides to 1600 px, unlock proportions and choose Pad to fit. This example keeps the complete product inside a square frame.",
      "href": "/help/resize-product-photos-without-cropping",
      "label": "Compare fit, crop and padding"
    },
    {
      "title": "Smaller images for a website",
      "body": "Use a maximum width with proportions locked, then inspect the result at the size your page displays. Avoid enlarging small originals.",
      "href": "/help/image-seo-filenames-alt-text",
      "label": "Prepare images for a website"
    },
    {
      "title": "Platform-specific image sizes",
      "body": "Need a product set, social cover or game capsule? Platform kits include separate frames and individual crop controls.",
      "href": "/tools",
      "label": "Explore image kits"
    }
  ],
  "compress": [
    {
      "title": "Photos that exceed an upload limit",
      "body": "Reduce oversized dimensions first, then compare quality settings. Check each output: Batch does not promise an exact KB target.",
      "href": "/help/reduce-image-file-size",
      "label": "Reduce image file size for uploads"
    },
    {
      "title": "PNG files that stay large",
      "body": "PNG is lossless; the JPG quality slider does not apply. For photos, compare WebP or JPG when the destination accepts them.",
      "href": "/help/convert-webp-png-jpg#png-to-webp",
      "label": "Compare PNG, WebP and JPG"
    },
    {
      "title": "Product photos with fine detail",
      "body": "Inspect lettering, edges and texture before lowering quality further. Always reprocess the original instead of an already compressed export.",
      "href": "/help/choosing-output-settings#quality",
      "label": "Understand image quality settings"
    }
  ],
  "convert": [
    {
      "title": "WebP to JPG for an upload form",
      "body": "Choose JPG when the destination rejects WebP. Transparent areas need a solid fill, and the output may be larger than the source.",
      "href": "/help/convert-webp-png-jpg#webp-to-jpg",
      "label": "Convert WebP to JPG"
    },
    {
      "title": "PNG to WebP with transparency",
      "body": "WebP can keep transparent pixels. Compare lossless output for sharp graphics with lossy output for smaller photo files.",
      "href": "/help/convert-webp-png-jpg#png-to-webp",
      "label": "Convert PNG to WebP"
    },
    {
      "title": "JPG to PNG for a required format",
      "body": "PNG avoids another lossy encoding pass, but it cannot restore detail already lost in the JPG or make an opaque background transparent.",
      "href": "/help/convert-webp-png-jpg#jpg-to-png",
      "label": "Understand JPG to PNG conversion"
    }
  ],
  "rename": [
    {
      "title": "Descriptive names for product photos",
      "body": "Use a product name plus {n}, for example cream-sneaker-{n}. Group related photos together and review the sequence before downloading.",
      "href": "/help/image-seo-filenames-alt-text#name-images",
      "label": "Image filenames and SEO"
    },
    {
      "title": "Keep original names and add a prefix",
      "body": "Use {name} in the pattern and add your collection name in Prefix. Preview names to catch duplicates before processing.",
      "href": "/help/choosing-output-settings#naming",
      "label": "Build a filename pattern"
    },
    {
      "title": "Rename without changing image quality",
      "body": "The rename-only tool keeps the original file bytes and metadata. Use the combined workspace when you also want to resize or convert.",
      "href": "/help/local-processing-and-browser-limits#stored",
      "label": "What happens to image metadata"
    }
  ]
};
