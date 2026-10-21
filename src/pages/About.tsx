import { useI18n } from '../i18n/LocaleContext';
import type { ArticleSection } from '../types/content';
import { EditorialLayout } from '../components/site/EditorialLayout';
import { ButtonLink } from '../components/ui/ButtonLink';

const SECTIONS: ArticleSection[] = [
{
  id: 'purpose',
  heading: 'What Batch is for',
  paragraphs: [
  'Most image tools are built around one picture at a time. But the real job often looks different: thirty product shots that all need to be square, a folder of event photos that’s too heavy to email, a set of screenshots that need consistent names.',
  'Batch is designed for that moment. You describe the result once, and every image in the batch follows the same plan.']

},
{
  id: 'workflow',
  heading: 'How it’s meant to work',
  paragraphs: ['The workflow has three parts, and each one is visible before anything happens to your files:'],
  list: [
  'Add images and see their real names, sizes, and dimensions.',
  'Choose any combination of resize, compress, convert, and rename settings.',
  'Review the planned output for every file, then run the batch and export.']

},
{
  id: 'principles',
  heading: 'Principles',
  paragraphs: [
  'Start immediately: no account, no trial, no email address. Keep files local: processing is designed to happen in your browser. Be honest about limits: if a format can’t be read or a setting won’t work, say so before the run starts, not after.']

},
{
  id: 'free',
  heading: 'Why it’s free',
  paragraphs: [
  'Batch is designed to be supported by advertising. Ads sit in clearly labeled, reserved spaces and are kept away from file controls, processing actions, and downloads. Personalized advertising would only be used with your consent.']

},
{
  id: 'prototype',
  heading: 'About this version',
  paragraphs: [
  'This version processes images locally and creates downloadable outputs. Browser support and memory limits vary by device; animated images can be renamed unchanged, while transformations require still images.']

}];


export function About() {
  const { tr } = useI18n();
  return (
    <EditorialLayout
      eyebrow="About"
      title={tr("A focused tool for preparing many images at once")}
      lede="Batch exists to turn a repetitive afternoon of exporting, resizing, and renaming into a single, predictable step."
      sections={SECTIONS}
      showAd
      footer={
      <div className="flex flex-wrap gap-2 border-t border-line pt-8">
          <ButtonLink to="/app" variant="primary">{tr("Open workspace")}</ButtonLink>
          <ButtonLink to="/tools" variant="secondary">{tr("Browse tools")}</ButtonLink>
        </div>
      } />);


}
