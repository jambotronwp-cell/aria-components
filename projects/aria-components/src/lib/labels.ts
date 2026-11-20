import { InjectionToken, Provider } from '@angular/core';

/** Every text the components show. English by default; an app passes its own with provideJtLabels(). */
export interface JtLabels {
  loading: string;
  empty: string;
  close: string;
  confirm: string;
  cancel: string;
  typeName: string;
  nameLabel: string;
  dontAsk: string;
  running: string;
  failed: string;
  showPassword: string;
  theme: string;
  themeAuto: string;
  themeLight: string;
  themeDark: string;
  notifications: string;
  toneSuccess: string;
  toneWarning: string;
  toneDanger: string;
  toneNeutral: string;
}

export const JT_DEFAULT_LABELS: JtLabels = {
  loading: 'Loading…',
  empty: 'Nothing here yet',
  close: 'Close',
  confirm: 'Confirm',
  cancel: 'Cancel',
  typeName: 'To confirm, type',
  nameLabel: 'Name',
  dontAsk: "Don't ask again",
  running: 'Working…',
  failed: 'Failed',
  showPassword: 'Show password',
  theme: 'Theme',
  themeAuto: 'Auto',
  themeLight: 'Light',
  themeDark: 'Dark',
  notifications: 'Notifications',
  toneSuccess: 'Working',
  toneWarning: 'In progress or needs attention',
  toneDanger: 'Error',
  toneNeutral: 'Off'
};

/**
 * Labels of the components. A function is read on every change detection, so it may follow the app's current language:
 * provideJtLabels(() => ({ cancel: translate('cancel'), ... })).
 */
export const JT_LABELS = new InjectionToken<() => JtLabels>('JT_LABELS', {
  providedIn: 'root',
  factory: () => () => JT_DEFAULT_LABELS
});

export function provideJtLabels(labels: Partial<JtLabels> | (() => Partial<JtLabels>)): Provider {
  const read = typeof labels === 'function' ? labels : () => labels;
  return { provide: JT_LABELS, useValue: () => ({ ...JT_DEFAULT_LABELS, ...read() }) };
}
