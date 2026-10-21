import { LEGAL_UPDATED, TERMS_SECTIONS } from '../data/legal';
import { EditorialLayout } from '../components/site/EditorialLayout';

export function Terms() {
  return (
    <EditorialLayout
      eyebrow="Legal"
      title="Terms of use"
      lede="The ground rules for using Batch, written plainly."
      meta={LEGAL_UPDATED}
      sections={TERMS_SECTIONS} />);


}
