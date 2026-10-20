import React from 'react';
import { MotionConfig } from 'framer-motion';
import { usePrefs } from '../../contexts/PrefsContext';

export function MotionPrefs({ children }: {children: React.ReactNode;}) {
  const { prefs } = usePrefs();
  return <MotionConfig reducedMotion={prefs.motion === 'reduce' ? 'always' : 'user'}>{children}</MotionConfig>;
}