import { useI18n } from '../i18n/LocaleContext';
import { LEGAL_UPDATED, PRIVACY_SECTIONS } from '../data/legal';
import { EditorialLayout } from '../components/site/EditorialLayout';

export function Privacy() {
  const { tr } = useI18n();
  return (
    <EditorialLayout
      eyebrow="Legal"
      title={tr("Privacy policy")}
      lede="How Batch handles your images, browser settings, and advertising choices."
      meta={LEGAL_UPDATED}
      sections={PRIVACY_SECTIONS} />);


}
