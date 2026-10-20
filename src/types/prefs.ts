export type ViewMode = 'grid' | 'list';
export type Density = 'comfortable' | 'compact';
export type MotionPref = 'system' | 'reduce';

export interface InterfacePrefs {
  view: ViewMode;
  density: Density;
  motion: MotionPref;
}

export interface CookieConsent {
  decided: boolean;
  preferences: boolean;
  measurement: boolean;
  advertising: boolean;
  updatedAt: number | null;
}

export type ConsentChoices = Pick<CookieConsent, 'preferences' | 'measurement' | 'advertising'>;