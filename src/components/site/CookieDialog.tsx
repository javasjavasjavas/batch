import { useEffect, useState } from 'react';
import type { ConsentChoices } from '../../types/prefs';
import { usePrefs } from '../../contexts/PrefsContext';
import { useToast } from '../../contexts/ToastContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';

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

  return (
    <Dialog
      open={cookieDialogOpen}
      onClose={close}
      title="Cookie preferences"
      description="Choose which optional cookies Batch may use. You can change this at any time from the footer."
      size="md"
      footer={
      <>
          <Button variant="ghost" onClick={() => {rejectAll();done('Optional cookies rejected');}} className="mr-auto">
            Reject all
          </Button>
          <Button variant="secondary" onClick={() => {saveConsent(draft);done('Cookie choices saved');}}>
            Save choices
          </Button>
          <Button variant="primary" onClick={() => {acceptAll();done('Optional cookies accepted');}}>
            Accept all
          </Button>
        </>
      }>
      
      <div className="divide-y divide-line rounded-xl border border-line">
        <div className="p-4">
          <Toggle
            checked
            onChange={() => undefined}
            disabled
            label="Necessary"
            description="Stores your settings, presets, and these choices on this device. Always on." />
          
        </div>
        {CATEGORIES.map((c) =>
        <div key={c.key} className="p-4">
            <Toggle
            checked={draft[c.key]}
            onChange={(v) => setDraft((d) => ({ ...d, [c.key]: v }))}
            label={c.label}
            description={c.description} />
          
          </div>
        )}
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted">
        This version doesn’t load any advertising, analytics, or tracking scripts. Your choices are saved locally to show how
        consent will work.
      </p>
    </Dialog>);

}
