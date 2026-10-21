import { useI18n } from '../../i18n/LocaleContext';
import React from 'react';
import { MotionConfig } from 'framer-motion';
import { usePrefs } from '../../contexts/PrefsContext';

export function MotionPrefs({ children }: {children: React.ReactNode;}) {
  const { tr } = useI18n();
  const { prefs } = usePrefs();
  return <MotionConfig reducedMotion={prefs.motion === 'reduce' ? 'always' : 'user'}>{tr(children)}</MotionConfig>;
}