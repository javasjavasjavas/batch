import { useI18n } from '../i18n/LocaleContext';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ConsentChoices, CookieConsent, InterfacePrefs } from '../types/prefs';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DEFAULT_PREFS: InterfacePrefs = { view: 'grid', density: 'comfortable', motion: 'system' };
const DEFAULT_CONSENT: CookieConsent = {
  decided: false,
  preferences: false,
  measurement: false,
  advertising: false,
  updatedAt: null
};

interface PrefsContextValue {
  prefs: InterfacePrefs;
  updatePrefs: (patch: Partial<InterfacePrefs>) => void;
  resetPrefs: () => void;
  consent: CookieConsent;
  saveConsent: (choices: ConsentChoices) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  cookieDialogOpen: boolean;
  setCookieDialogOpen: (open: boolean) => void;
  demoOffline: boolean;
  setDemoOffline: (value: boolean) => void;
}

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({ children }: {children: React.ReactNode;}) {
  const { tr } = useI18n();
  const [prefs, setPrefs] = useLocalStorage<InterfacePrefs>('batch.prefs', DEFAULT_PREFS);
  const [consent, setConsent] = useLocalStorage<CookieConsent>('batch.consent', DEFAULT_CONSENT);
  const [cookieDialogOpen, setCookieDialogOpen] = useState(false);
  const [demoOffline, setDemoOffline] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', prefs.motion === 'reduce');
  }, [prefs.motion]);

  const updatePrefs = useCallback((patch: Partial<InterfacePrefs>) => setPrefs((p) => ({ ...p, ...patch })), [setPrefs]);
  const resetPrefs = useCallback(() => setPrefs(DEFAULT_PREFS), [setPrefs]);
  const saveConsent = useCallback(
    (choices: ConsentChoices) => setConsent({ ...choices, decided: true, updatedAt: Date.now() }),
    [setConsent]
  );
  const acceptAll = useCallback(
    () => saveConsent({ preferences: true, measurement: true, advertising: true }),
    [saveConsent]
  );
  const rejectAll = useCallback(
    () => saveConsent({ preferences: false, measurement: false, advertising: false }),
    [saveConsent]
  );

  const value = useMemo(
    () => ({
      prefs,
      updatePrefs,
      resetPrefs,
      consent,
      saveConsent,
      acceptAll,
      rejectAll,
      cookieDialogOpen,
      setCookieDialogOpen,
      demoOffline,
      setDemoOffline
    }),
    [prefs, updatePrefs, resetPrefs, consent, saveConsent, acceptAll, rejectAll, cookieDialogOpen, demoOffline]
  );

  return <PrefsContext.Provider value={value}>{tr(children)}</PrefsContext.Provider>;
}

export function usePrefs(): PrefsContextValue {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider');
  return ctx;
}