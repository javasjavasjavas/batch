import type { ArticleSection } from '../types/content';

export const PRIVACY_SECTIONS: ArticleSection[] = [
{
  id: 'summary',
  heading: 'Summary',
  paragraphs: [
  'Batch is designed to work without accounts and to process images on your device. This page describes the information the product is intended to handle once it is published.']

},
{
  id: 'images',
  heading: 'Your images',
  paragraphs: [
  'Images you add are read by your browser so they can be previewed and, in the finished product, processed. They are not intended to be uploaded to or stored on any server operated for Batch.',
  'Closing or reloading the page clears the batch. Image contents are not saved to local storage.',
  'If you choose AI background removal, your browser downloads model files from Hugging Face. That provider receives the normal network request, including your IP address, but not your images or file names. The model is cached on your device for reuse.']

},
{
  id: 'device-storage',
  heading: 'Information stored on your device',
  paragraphs: ['Batch uses your browser’s local storage to remember choices between visits:'],
  list: [
  'Interface preferences such as grid or list view, density, and reduced motion',
  'Current tool settings and any presets you save',
  'Your cookie and advertising choices']

},
{
  id: 'advertising',
  heading: 'Advertising and cookies',
  paragraphs: [
  'Batch is intended to be funded by advertising. Ad partners may use cookies or similar technologies, and where required, personalized advertising will only be enabled with your consent.',
  'The specific partners, purposes, and retention periods will be listed here before publication. No advertising or tracking scripts are loaded in this version.']

},
{
  id: 'measurement',
  heading: 'Measurement',
  paragraphs: [
  'Aggregate usage measurement may be used to understand which tools are helpful. It would only run if you allow measurement cookies, and would not include image contents or file names.']

},
{
  id: 'choices',
  heading: 'Your choices',
  paragraphs: [
  'You can change cookie choices at any time from Cookie preferences in the footer. You can remove locally stored preferences and presets in the workspace preferences, or by clearing site data in your browser.']

},
{
  id: 'contact',
  heading: 'Changes and contact',
  paragraphs: [
  'This policy will be dated and versioned once finalized. Contact details for privacy questions will be added before publication.']

}];


export const TERMS_SECTIONS: ArticleSection[] = [
{
  id: 'using',
  heading: 'Using Batch',
  paragraphs: [
  'Batch is a free tool for preparing images in bulk. You can use it without creating an account. By using it, you agree to these terms once they are finalized and published.']

},
{
  id: 'content',
  heading: 'Your content',
  paragraphs: [
  'You keep all rights to the images you work with. Because processing is designed to happen on your device, Batch does not receive or claim any license to your files.',
  'You are responsible for having the right to use, modify, and share the images you process.']

},
{
  id: 'acceptable-use',
  heading: 'Acceptable use',
  paragraphs: ['Please don’t use Batch to:'],
  list: [
  'Interfere with the service or attempt to disrupt its availability',
  'Remove or hide advertising through automated means that break the page',
  'Process content in a way that violates applicable law or other people’s rights']

},
{
  id: 'ads',
  heading: 'Advertising',
  paragraphs: [
  'Batch displays clearly labeled advertising to remain free. Ads are kept separate from file controls and downloads. Advertisers are responsible for their own content.']

},
{
  id: 'availability',
  heading: 'Availability and changes',
  paragraphs: [
  'Features may change, and the service may be unavailable at times. Because work happens in your browser, results also depend on your device and browser capabilities.']

},
{
  id: 'disclaimers',
  heading: 'Disclaimers',
  paragraphs: [
  'Batch is provided as is. Keep your original files: processed images are new copies, and you should check them before relying on them. Final warranty and liability language will be added after legal review.']

},
{
  id: 'contact',
  heading: 'Contact',
  paragraphs: ['Contact details and the effective date will be added before publication.']
}];
