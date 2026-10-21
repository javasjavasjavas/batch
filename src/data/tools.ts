import type { ToolInfo } from '../types/content';

export const TOOLS: ToolInfo[] = [
{
  id: 'resize',
  slug: 'bulk-image-resizer',
  name: 'Bulk Image Resizer',
  tagline: 'Set exact dimensions or a maximum size for every image at once.',
  title: 'Bulk image resizer: resize photos online',
  lede:
  'Marketplaces, social feeds, and site templates each want their own dimensions. Set the target once and every image in the batch is planned to match, with proportions kept or framed to an exact size.',
  dropTitle: 'Drop the images you want to resize',
  settingsPreview: [
  { label: 'Width', value: '1600 px' },
  { label: 'Height', value: '1600 px' },
  { label: 'Proportions', value: 'Kept' },
  { label: 'Enlarge small images', value: 'No' }],

  steps: [
  { title: 'Add your images', body: 'Mixed sizes and orientations are fine. Each image is measured on its own.' },
  { title: 'Pick a target', body: 'Start from a preset like Square 1080, or type the exact width and height you need.' },
  { title: 'Choose how they fit', body: 'Keep proportions inside a box, crop to fill, or pad to an exact frame with a background color.' }],

  notes: [
  {
    title: 'Fit within vs. exact size',
    body: 'Fit within keeps every image’s shape and makes it no larger than your box, so a tall bottle and a wide sneaker end up with different dimensions. Exact size gives every file identical dimensions by cropping or padding.'
  },
  {
    title: 'Small images stay sharp',
    body: 'By default, images that are already smaller than the target aren’t enlarged. Upscaling adds pixels without adding detail.'
  }],

  faqs: [
  { q: 'Can I resize by percentage?', a: 'Yes. Switch the unit to Percent to scale every image by the same factor, for example 50% to halve both dimensions.' },
  {
    q: 'What happens to images with different aspect ratios?',
    a: 'With proportions locked, each image keeps its own shape. With an exact size, choose Crop to fill to trim the edges, or Pad to fit to add a background around the image.'
  },
  { q: 'Is there a maximum size?', a: 'You can enter up to 10,000 pixels per side. Very large outputs can be slow in a browser tab, especially on phones.' }],

  keywords: ['resize', 'dimensions', 'width', 'height', 'scale', 'square', 'thumbnail', 'crop', 'pad', 'size']
},
{
  id: 'compress',
  slug: 'image-compressor',
  name: 'Image Compressor',
  tagline: 'Shrink file sizes with one quality level for the whole batch.',
  title: 'Compress images in bulk online',
  lede:
  'Heavy photos slow down pages and run into upload limits. Pick one quality level for the batch and see exactly what it means before anything is exported.',
  dropTitle: 'Drop the images you want to make smaller',
  settingsPreview: [
  { label: 'Quality', value: '82' },
  { label: 'Preset', value: 'Balanced' },
  { label: 'Metadata', value: 'Removed' }],

  steps: [
  { title: 'Add your images', body: 'Photos straight from a camera or phone benefit the most.' },
  { title: 'Choose a quality', body: 'Start with Balanced. Slide down for smaller files, or up when fine texture matters.' },
  { title: 'Review the plan', body: 'Confirm the quality and metadata choices on the review screen before running the batch.' }],

  notes: [
  {
    title: 'What quality means',
    body: 'Quality controls how much detail lossy formats like JPG and WebP keep. Between 75 and 85, most photos look unchanged at normal viewing size while their files get much smaller.'
  },
  {
    title: 'Removing metadata',
    body: 'Photos often carry camera details and sometimes a location. Removing metadata trims a little size and avoids sharing that information by accident.'
  }],

  faqs: [
  { q: 'Which quality should I use for a website?', a: 'Around 75–82 is a good default for product and blog photos. Use 85–90 for large hero images where texture matters.' },
  {
    q: 'Does compression work on PNG files?',
    a: 'PNG is lossless, so the quality slider doesn’t apply. To make PNG photos much smaller, combine compression with converting to WebP or JPG.'
  },
  { q: 'Will compressing the same file twice make it worse?', a: 'Yes. Each lossy pass discards a little more detail, so it’s best to start from your original files.' }],

  keywords: ['compress', 'quality', 'smaller', 'optimize', 'file size', 'kb', 'mb', 'metadata', 'exif']
},
{
  id: 'convert',
  slug: 'image-converter',
  name: 'Image Converter',
  tagline: 'Switch a batch between JPG, PNG, and WebP.',
  title: 'Convert images between JPG, PNG, and WebP',
  lede:
  'Different destinations expect different formats. Choose one output format for the whole batch, and Batch takes care of what comes with it, like what happens to transparent backgrounds.',
  dropTitle: 'Drop the images you want to convert',
  settingsPreview: [
  { label: 'Output format', value: 'WebP' },
  { label: 'Encoding', value: 'Lossy' },
  { label: 'Transparency', value: 'Preserved' }],

  steps: [
  { title: 'Add your images', body: 'Mix formats freely. JPG, PNG, WebP, GIF, and AVIF can go in one batch.' },
  { title: 'Pick the output', body: 'WebP for the web, JPG for the widest compatibility, PNG for lossless quality and transparency.' },
  { title: 'Set format details', body: 'Choose a fill color for transparent areas when converting to JPG, or lossless encoding for WebP.' }],

  notes: [
  {
    title: 'Transparency and JPG',
    body: 'JPG can’t store transparent pixels. When a PNG with a transparent background becomes a JPG, those areas are filled with the color you choose. White is the default.'
  },
  {
    title: 'Animated GIFs',
    body: 'Animated images can be renamed without changing their contents. Resizing, compression and conversion are blocked for animated files to preserve their frames; use a still image for those operations.'
  }],

  faqs: [
  {
    q: 'Which format should I choose?',
    a: 'WebP often produces smaller files for websites; compare the result with your original. JPG works almost everywhere, including email and older software. PNG keeps every pixel and supports transparency, but files are larger.'
  },
  { q: 'Is WebP widely supported?', a: 'All current major browsers display WebP. Some older desktop software and a few upload forms still expect JPG.' },
  {
    q: 'Can I convert HEIC photos from an iPhone?',
    a: 'Not yet. Most browsers can’t read HEIC, so export those photos as JPG first, or set your camera format to Most Compatible.'
  }],

  keywords: ['convert', 'format', 'jpg', 'jpeg', 'png', 'webp', 'transparency', 'gif', 'avif']
},
{
  id: 'rename',
  slug: 'bulk-file-renamer',
  name: 'Bulk File Renamer',
  tagline: 'Give a batch consistent names with patterns and numbering.',
  title: 'Bulk image file renamer online',
  lede:
  'IMG_4821.jpg doesn’t tell anyone what’s inside. Build a naming pattern with numbers, original names, and dates, and see every new filename before you commit.',
  dropTitle: 'Drop the images you want to rename',
  settingsPreview: [
  { label: 'Pattern', value: 'product-{n}' },
  { label: 'Numbering', value: 'From 1, 3 digits' },
  { label: 'First file', value: 'product-001.jpg' }],

  steps: [
  { title: 'Add your images', body: 'Put them in the order you want. You can reorder the batch before naming.' },
  { title: 'Build a pattern', body: 'Combine your own text with {n} for a number, {name} for the original name, and {date} for today.' },
  { title: 'Check the preview', body: 'Every planned filename is listed, so duplicates and typos are easy to spot.' }],

  notes: [
  {
    title: 'Order sets the numbers',
    body: 'Numbers follow the order of images in your batch. Move images earlier or later in the workspace to decide which file gets 001.'
  },
  {
    title: 'Safe file names',
    body: 'Characters like / : * ? are blocked because operating systems reject them. Optional clean-up lowercases names and turns spaces into hyphens for tidy URLs.'
  }],

  faqs: [
  { q: 'Can I keep part of the original name?', a: 'Yes. Use {name} in the pattern, for example {name}-web, to keep the original name and add to it.' },
  { q: 'How do I make numbers start at 100?', a: 'Set Starting number to 100. Padding adds leading zeros, so 3 digits gives 001, 002, and so on.' },
  { q: 'Does renaming change the image itself?', a: 'No. Renaming only affects the file name. Turn on Resize or Convert as well if you want to change the image.' }],

  keywords: ['rename', 'name', 'filename', 'pattern', 'number', 'sequence', 'prefix', 'suffix']
}];