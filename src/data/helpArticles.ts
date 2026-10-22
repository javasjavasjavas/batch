import { IMAGE_SEO_GUIDE } from './imageSeoGuide';
import { ARTICLE_META } from './articleMetadata';
import type { HelpArticle } from '../types/content';
import { WORKFLOW_GUIDES } from './workflowGuides';

export const HELP_ARTICLES: HelpArticle[] = [
...WORKFLOW_GUIDES,
IMAGE_SEO_GUIDE,
{
  ...ARTICLE_META['getting-started-with-a-batch'],
    sections: [
  {
    id: 'add-images',
    heading: 'Add your images',
    paragraphs: [
    'Open the workspace and drop images onto the dropzone, or use Choose images to pick them from your device. You can add more at any time with Add images in the toolbar.',
    'Each image shows its original name, file size, and pixel dimensions as soon as your browser has read it. If an image can’t be read, it’s marked “Preview unavailable” so you can remove or replace it.'],

    list: ['Inputs: JPG, PNG, WebP, GIF, and AVIF when your browser can decode them', 'Outputs: JPG, PNG, and WebP', 'Animated images can be renamed unchanged; resizing, compression, and conversion are blocked to preserve every frame', 'Not supported: HEIC, TIFF, SVG, and RAW camera files']
  },
  {
    id: 'organize',
    heading: 'Organize the batch',
    paragraphs: [
    'Switch between grid and list view with the toggle in the toolbar. Select images with their checkboxes to remove several at once, and use the arrow buttons on each image to change its position. Order matters when you rename with numbers.',
    'Open any image to see a larger preview, its details, and exactly what is planned for it.']

  },
  {
    id: 'choose-tools',
    heading: 'Choose tools and settings',
    paragraphs: [
    'The settings panel has a tab for each tool: Resize, Compress, Convert, and Rename. Turn on the ones you need with the switch at the top of each tab. You can combine all four.',
    'If a value can’t be used, the field is outlined and a short message explains why. Save combinations you use often as presets.']

  },
  {
    id: 'review',
    heading: 'Review and run',
    paragraphs: [
    'Select Review batch to see every included image with its planned name and size, plus a summary of your settings and any warnings. From there you can start the run or go back to editing.',
    'Processing creates new image files in your browser. You can download them individually or together in a ZIP. Originals are unchanged.']

  }]

},
{
  ...ARTICLE_META['choosing-output-settings'],
    sections: [
  {
    id: 'size',
    heading: 'Size',
    paragraphs: [
    'Use Fit within when images have different shapes and you just need them no larger than a limit, such as 1920 pixels wide for a website. Each image keeps its own proportions.',
    'Use an exact size when every file must match, such as square marketplace listings. Crop to fill trims the edges; Pad to fit keeps the whole image and adds a background color around it.']

  },
  {
    id: 'quality',
    heading: 'Quality',
    paragraphs: [
    'Quality affects JPG and WebP output. 75–82 suits most web photos; 85–90 is better for large images where texture matters. Below 40, blocky artifacts become noticeable.'],

    list: ['Smaller: 60', 'Balanced: 75', 'High: 85', 'Maximum: 95']
  },
  {
    id: 'format',
    heading: 'Format',
    paragraphs: [
    'WebP often makes small files and supports transparency. JPG is a compatible choice for photos. PNG is lossless and keeps transparency, but photos can become large.',
    'When converting images with transparent areas to JPG, choose the color that should fill those areas.']

  },
  {
    id: 'naming',
    heading: 'Naming',
    paragraphs: [
    'Patterns combine your own text with placeholders: {n} for a sequence number, {name} for the original name, and {date} for the local calendar date captured when a run starts. Prefix and suffix are added around the pattern.',
    'With more than one image, include {n} or {name} so names stay unique. The preview in the Rename tab lists the first planned names so you can check them.']

  }]

},
{
  ...ARTICLE_META['local-processing-and-browser-limits'],
    sections: [
  {
    id: 'local',
    heading: 'What local processing means',
    paragraphs: [
    'Batch is designed so images are read and processed by your browser, on your device. They aren’t uploaded to a server, which keeps private photos private and avoids waiting for uploads.',
    'The browser decodes and processes your images locally. AI background removal downloads a 183 MB BiRefNet model from Hugging Face on first use and caches it in your browser. User images and their names are never sent with these downloads.']

  },
  {
    id: 'backgrounds',
    heading: 'Product backgrounds',
    paragraphs: [
    'In Resize, choose Extend gradient to continue a simple studio background into extra space. This uses the colors along the image edges and keeps the original photo intact. Use exact dimensions and Pad to fit. Busy backgrounds, objects touching the edge, and large extensions can produce visible streaks.',
    'Remove background uses AI to isolate the product. Choose PNG or WebP for transparent output. Replace background uses the same cutout with your chosen color. Fine edges, glass, reflections, and shadows may need review in Compare. These options run on your device; the first model download requires an internet connection.']
  },
  {
    id: 'stored',
    heading: 'What is stored',
    paragraphs: [
    'Interface preferences, cookie choices, current settings, and saved presets are kept in your browser’s local storage so they’re there next time. Image contents are never stored; refreshing or closing the tab clears the batch.',
    'Re-encoding removes camera and location metadata. Rename only keeps the original bytes and metadata. Preserving metadata while compressing is blocked because it cannot be done reliably across these formats.']

  },
  {
    id: 'limits',
    heading: 'Browser limits',
    paragraphs: [
    'Because the work happens on your device, speed depends on its memory and processor. Process smaller batches on phones.'],

    list: [
    'Each file is limited to 40 MB, 10,000 pixels per side, and 40 megapixels. A batch is limited to 100 files and 300 MB of input.',
    'A ZIP of completed outputs is limited to 300 MB in memory. Larger outputs can be downloaded individually.',
    'HEIC and RAW files can’t be read by most browsers.',
    'Keeping the tab in the foreground helps long batches finish faster.']

  }]

}];
