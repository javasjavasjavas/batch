import type { FaqItem, HelpCategory, TroubleshootingEntry } from '../types/content';

export const HELP_CATEGORIES: HelpCategory[] = [
{
  id: 'getting-started',
  title: 'Getting started',
  description: 'Add images, pick a tool, and review your first batch.',
  href: '/help/getting-started-with-a-batch'
},
{
  id: 'settings',
  title: 'Output settings',
  description: 'Sizes, quality, formats, and naming patterns explained.',
  href: '/help/choosing-output-settings'
},
{
  id: 'local',
  title: 'Local processing',
  description: 'What stays on your device and what browsers can handle.',
  href: '/help/local-processing-and-browser-limits'
},
{
  id: 'troubleshooting',
  title: 'Troubleshooting',
  description: 'Fixes for previews, skipped files, and slow batches.',
  href: '/help#troubleshooting'
}];


export const HELP_FAQS: FaqItem[] = [
{ q: 'Do I need an account?', a: 'No. Open the workspace and add images. Nothing asks you to sign up or sign in.' },
{
  q: 'Can I combine tools in one batch?',
  a: 'Yes. Turn on any combination of Resize, Compress, Convert, and Rename. They’re planned in that order, so a batch can be resized, converted to WebP, and renamed together.'
},
{
  q: 'Can I use Batch on my phone?',
  a: 'Yes. The workspace adapts to small screens, with settings in a bottom sheet. Large batches are slower on phones because they have less memory.'
},
{
  q: 'Where are my presets stored?',
  a: 'In your browser’s local storage on this device. Clearing site data removes them, and they don’t sync between devices or browsers.'
},
{
  q: 'How do I download my results?',
  a: 'After processing, download any image individually or create a ZIP containing the successful outputs. ZIP creation has a 300 MB memory limit.'
},
{
  q: 'Are sample images processed for real?',
  a: 'Yes. Try a sample batch loads bundled image files and uses the same local processing engine as your own files.'
}];


export const TROUBLESHOOTING: TroubleshootingEntry[] = [
{
  problem: 'An image shows “Preview unavailable”',
  fix: 'Your browser couldn’t decode the file. It may be damaged or saved in an unusual variant of its format. Re-export it from your photo editor as JPG or PNG and add it again.'
},
{
  problem: 'HEIC, TIFF, or SVG files were skipped',
  fix: 'Batch only accepts formats browsers can preview: JPG, PNG, WebP, GIF, and AVIF. Export iPhone photos as JPG, or set the camera format to Most Compatible.'
},
{
  problem: 'The workspace feels slow with many photos',
  fix: 'Remove images you don’t need, split very large sets into smaller batches, or close other heavy tabs. Batch processes one image at a time.'
},
{
  problem: 'My saved presets are gone',
  fix: 'Presets live in this browser only. Private windows, clearing site data, or switching browsers or devices starts you fresh.'
},
{
  problem: 'A setting is outlined in red',
  fix: 'The value can’t be used, for example a width of 0. The message under the field explains what to change.'
}];
