import { useI18n } from '../../i18n/LocaleContext';
import { useEffect, useState } from 'react';
import type { ConsentChoices } from '../../types/prefs';
import { usePrefs } from '../../contexts/PrefsContext';
import { useToast } from '../../contexts/ToastContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { consentReady } from '../../advertising/config';

const CATEGORIES: {key: keyof ConsentChoices;label: string;description: string;}[] = [
{
  key: 'preferences',
  label: 'Preferences',
  description: 'Remember optional conveniences across visits, such as dismissed tips.'
},
{
  key: 'measurement',
  label: 'Measurement',
  description: 'Aggregate statistics about which tools are used. Never includes images or file names.'
},
{
  key: 'advertising',
  label: 'Personalized advertising',
  description: 'Lets ad partners tailor ads to your interests. When off, ads may still appear but are not personalized.'
}];


export function CookieDialog() {
  const { tr } = useI18n();
  const { cookieDialogOpen, setCookieDialogOpen, consent, saveConsent, acceptAll, rejectAll } = usePrefs();
  const { toast } = useToast();
  const [draft, setDraft] = useState<ConsentChoices>(consent);

  useEffect(() => {
    if (cookieDialogOpen) setDraft({ preferences: consent.preferences, measurement: consent.measurement, advertising: consent.advertising });
  }, [cookieDialogOpen, consent]);

  const close = () => setCookieDialogOpen(false);
  const done = (message: string) => {
    close();
    toast({ tone: 'success', title: message });
  };

  if (consentReady) return <Dialog open={cookieDialogOpen} onClose={close} title={tr("Privacy and cookie settings")} size="md">
    <p className="text-sm leading-relaxed text-muted">{tr("Advertising choices are managed by Google's consent message. Batch does not share your images or file names with advertisers.")}</p>
    <Button className="mt-5" onClick={() => {
      if (window.googlefc?.showRevocationMessage) {
        close();
        (window.googlefc.callbackQueue ||= []).push({ CONSENT_API_READY: () => window.googlefc?.showRevocationMessage?.() });
      }
      else toast({ tone: 'info', title: 'Consent settings unavailable', description: 'The Google consent message may not apply in your region, or may be blocked by your browser.' });
    }}>{tr("Manage European consent choices")}</Button>
    <p className="mt-4 text-sm text-muted">{tr("For applicable US states, use Google's Do not sell or share my personal information link on this page. You can remove local settings by clearing this site's browser data.")}</p>
  </Dialog>;

  return (
    <Dialog
      open={cookieDialogOpen}
      onClose={close}
      title={tr("Cookie preferences")}
      description={tr("Choose which optional cookies Batch may use. You can change this at any time from the footer.")}
      size="md"
      footer={
      <>
          <Button variant="ghost" onClick={() => {rejectAll();done('Optional cookies rejected');}} className="mr-auto">{tr("Reject all")}</Button>
          <Button variant="secondary" onClick={() => {saveConsent(draft);done('Cookie choices saved');}}>{tr("Save choices")}</Button>
          <Button variant="primary" onClick={() => {acceptAll();done('Optional cookies accepted');}}>{tr("Accept all")}</Button>
        </>
      }>
      
      <div className="divide-y divide-line rounded-xl border border-line">
        <div className="p-4">
          <Toggle
            checked
            onChange={() => undefined}
            disabled
            label={tr("Necessary")}
            description={tr("Stores your settings, presets, and these choices on this device. Always on.")} />
          
        </div>
        {CATEGORIES.map((c) =>
        <div key={c.key} className="p-4">
            <Toggle
            checked={draft[c.key]}
            onChange={(v) => setDraft((d) => ({ ...d, [c.key]: v }))}
            label={tr(c.label)}
            description={tr(c.description)} />
          
          </div>
        )}
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted">{tr("This version doesn’t load any advertising, analytics, or tracking scripts. Your choices are saved locally to show how consent will work.")}</p>
    </Dialog>);

}
