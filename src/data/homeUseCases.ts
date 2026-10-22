export const HOME_USE_CASES = [
  {
    visual: 'product', category: 'Ecommerce', title: 'One beautiful catalog.',
    body: 'Same dimensions. Every product fully in frame.',
    toolHref: '/tools/bulk-image-resizer', action: 'Resize products',
    href: '/help/resize-product-photos-without-cropping', label: 'Keep the full product',
  },
  {
    visual: 'website', category: 'Websites', title: 'Make every byte count.',
    body: 'Lighter images, prepared for your next page.',
    toolHref: '/tools/image-compressor', action: 'Optimize images',
    href: '/help/image-seo-filenames-alt-text', label: 'Choose export settings',
  },
  {
    visual: 'format', category: 'Compatibility', title: 'The right format. Done.',
    body: 'JPG, PNG or WebP. Get files your next upload accepts.',
    toolHref: '/tools/image-converter', action: 'Convert images',
    href: '/help/convert-webp-png-jpg', label: 'Find the right format',
  },
  {
    visual: 'steam', category: 'Game developers', title: 'Get ready for Steam.',
    body: 'Your artwork, framed for Steam capsules and library images.',
    toolHref: '/tools/steam-assets', action: 'Build a Steam kit',
    href: '/help/choosing-output-settings', label: 'Explore export settings',
  },
] as const;
