import { PRIVACY_SECTIONS } from '../data/legal';
import { EditorialLayout } from '../components/site/EditorialLayout';

export function Privacy() {
  return (
    <EditorialLayout
      eyebrow="Legal"
      title="Privacy policy"
      lede="How Batch is intended to handle your images, preferences, and advertising choices."
      meta="Draft · Not yet in effect"
      draft
      sections={PRIVACY_SECTIONS} />);


}