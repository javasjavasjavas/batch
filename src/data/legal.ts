import type { ArticleSection } from '../types/content';
import { advertisingReady } from '../advertising/config';

export const LEGAL_UPDATED = 'Last updated: October 21, 2026';
const contact = { label: 'Contact Javier D’Amico: javdamico@gmail.com', href: 'mailto:javdamico@gmail.com' };

export const PRIVACY_SECTIONS: ArticleSection[] = [
  { id: 'summary', heading: 'Who operates Batch', paragraphs: [
    'Batch Image Kit (batchimagekit.com) is operated by Javier D’Amico. Contact javdamico@gmail.com for privacy questions or requests. This policy explains how the website handles images, browser settings and information received by service providers.'
  ] },
  { id: 'images', heading: 'Your images stay on your device', paragraphs: [
    'Your browser reads and processes the images you choose, including previews, resizing, compression, conversion, renaming and ZIP downloads. Batch does not upload your image contents or file names to its servers or send them to advertisers.',
    'The current batch is held in browser memory and is cleared when the page is closed or reloaded. Downloaded files remain wherever you save them. Batch does not store your image contents in local storage.',
    'Optional AI features download model files from external providers such as Hugging Face. These requests expose normal connection information, including your IP address, to the provider; image processing remains local. Your browser may cache models and application resources.'
  ], links: [{ label: 'Hugging Face privacy policy', href: 'https://huggingface.co/privacy' }] },
  { id: 'device-storage', heading: 'Browser storage', paragraphs: [
    'Batch stores interface preferences, tool settings, saved presets and privacy choices in your browser. These settings are not an online account. They remain until replaced, reset or removed through your browser’s site-data controls. Cached resources remain subject to your browser’s storage management.'
  ] },
  { id: 'hosting', heading: 'Website delivery and security', paragraphs: [
    'Cloudflare hosts and delivers the website. Loading a page sends connection information such as your IP address, requested URL, browser information and request time to the hosting provider. This supports delivery, reliability and security; it does not include the image files you process.',
    'Providers may process connection information in countries other than your own. Their retention and international-transfer practices are described in their privacy notices. Batch does not operate a separate database of uploaded images.'
  ], links: [{ label: 'Cloudflare privacy policy', href: 'https://www.cloudflare.com/privacypolicy/' }] },
  { id: 'advertising', heading: 'Google AdSense and advertising choices', paragraphs: [
    advertisingReady
      ? 'Batch uses Google AdSense to fund this free service. Google and participating advertising providers may use cookies, device identifiers and similar technologies to deliver and measure ads, prevent fraud and, where permitted by your choices, personalize advertising.'
      : 'Batch is preparing to use Google AdSense to fund this free service. Advertising placements are currently disabled pending site approval. Google’s consent tools may be loaded to manage privacy choices; loading them sends normal connection information to Google. The following explains how advertising will work when enabled.',
    'Google and other advertising providers can base personalized ads on previous visits to this website and other websites. When advertising is enabled, your browser may send Google your IP address, the page URL and browser or device information. We do not add image contents or file names to these requests.',
    'Where applicable, Google’s consent message will let you accept, decline or manage advertising purposes and participating providers before consent-dependent advertising is used. You can revisit advertising choices through Cookie preferences in the footer. Declining personalization does not necessarily remove all ads; contextual or limited ads may be available subject to your choices and applicable requirements.',
    'Google explains its data use and retention in the notices below. You can also manage personalization in Google’s ad settings or use the industry opt-out tools for participating third-party providers. Browser cookie controls are available independently of these choices.'
  ], links: [
    { label: 'How Google uses information from partner sites', href: 'https://policies.google.com/technologies/partner-sites' },
    { label: 'Google advertising technologies and retention', href: 'https://policies.google.com/technologies/ads' },
    { label: 'Google privacy policy', href: 'https://policies.google.com/privacy' },
    { label: 'Manage Google ad personalization', href: 'https://adssettings.google.com/' },
    { label: 'Choices for participating third-party advertising providers', href: 'https://optout.aboutads.info/' }
  ] },
  { id: 'measurement', heading: 'Measurement and contact messages', paragraphs: [
    'Batch currently has no separate Google Analytics or session-recording integration. When advertising is enabled, AdSense may measure ad delivery and performance as described above.',
    'If you email us, we receive your email address and the information you choose to send so we can respond. Do not send private images or sensitive documents unless they are necessary to your request. Contact correspondence is retained only as needed to handle the request and applicable record-keeping obligations.'
  ] },
  { id: 'choices', heading: 'Your choices and requests', paragraphs: [
    'You can remove browser settings through this site’s browser-data controls and reset interface preferences in the Workspace. Removing site data also removes saved presets and privacy choices. Contact us to ask about access, correction or deletion of personal information we hold, or to raise a privacy concern. Rights and available remedies depend on your jurisdiction; you may also contact the relevant data-protection authority.',
    'Batch is a general-purpose image utility and is not directed at children. If you believe a child has sent us personal information, contact us so we can investigate and remove it where appropriate.',
    'We will update this page when the service or its data practices change and show the revision date above.'
  ], links: [contact] }
];

export const TERMS_SECTIONS: ArticleSection[] = [
  { id: 'using', heading: 'Using Batch', paragraphs: [
    'Batch Image Kit is a free browser-based image utility operated by Javier D’Amico. These terms apply to your use of batchimagekit.com. If you do not agree with them, do not use the service.'
  ] },
  { id: 'content', heading: 'Your files and responsibilities', paragraphs: [
    'You keep your rights to your images. Batch does not claim ownership of your files. You are responsible for having permission to process and use them, and for checking outputs before publishing or relying on them.',
    'Keep your originals. Processing may change quality, dimensions, color or metadata. Work held in browser memory can be lost if you close or reload the page. Compatibility and processing limits depend on your browser and device.'
  ] },
  { id: 'acceptable-use', heading: 'Acceptable use', paragraphs: ['Do not use the service to:'], list: [
    'Violate applicable law or the rights of others',
    'Disrupt the website, attack its infrastructure or attempt unauthorized access',
    'Generate fraudulent advertising clicks or impressions'
  ] },
  { id: 'ads', heading: 'Advertising and external services', paragraphs: [
    'Batch may display labeled advertising to support the free service. An ad is not an endorsement. External websites and optional model providers operate under their own terms and privacy policies. Batch’s privacy policy explains its data practices.'
  ], links: [{ label: 'Read the privacy policy', href: '/privacy' }] },
  { id: 'availability', heading: 'Availability and limitations', paragraphs: [
    'Features and availability may change. The service is provided as available, without a promise that every file, device or intended use will be supported or that results will be error-free. To the extent permitted by applicable law, Batch disclaims implied warranties. Nothing in these terms excludes rights or liabilities that cannot legally be excluded.',
    'Platform asset dimensions and recommendations can change independently of Batch. Check the destination platform’s current requirements before submitting important assets.'
  ] },
  { id: 'contact', heading: 'Changes and contact', paragraphs: [
    'Updates to these terms will appear here with a revised date. Contact Javier D’Amico at javdamico@gmail.com with questions about the service or these terms.'
  ], links: [contact] }
];
