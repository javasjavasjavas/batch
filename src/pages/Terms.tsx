import { useI18n } from '../i18n/LocaleContext';
import { LEGAL_UPDATED, TERMS_SECTIONS } from '../data/legal';
import { EditorialLayout } from '../components/site/EditorialLayout';

export function Terms() {
  const { tr } = useI18n();
  return (
    <EditorialLayout
      eyebrow="Legal"
      title={tr("Terms of use")}
      lede="The ground rules for using Batch, written plainly."
      meta={LEGAL_UPDATED}
      sections={TERMS_SECTIONS} />);


}
