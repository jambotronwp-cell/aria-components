import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type JtThemeChoice = 'auto' | 'light' | 'dark';

const KEY = 'jt-theme';

/**
 * Light / dark / auto (system). Sets data-theme on <html> — the tokens of styles/aria-components.scss follow it;
 * auto removes it (prefers-color-scheme decides). The choice is kept in localStorage ('jt-theme').
 */
@Injectable({ providedIn: 'root' })
export class JtThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly systemDark = signal(false);

  readonly choice = signal<JtThemeChoice>(this.read());
  /** The theme in effect */
  readonly theme = computed<'light' | 'dark'>(() => {
    const choice = this.choice();
    return choice === 'auto' ? (this.systemDark() ? 'dark' : 'light') : choice;
  });

  constructor() {
    if (this.browser && typeof matchMedia === 'function') {
      const query = matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(query.matches);
      query.addEventListener?.('change', event => this.systemDark.set(event.matches));
    }
    effect(() => {
      const choice = this.choice();
      const root = this.document.documentElement;
      if (choice === 'auto') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', choice);
      }
      if (this.browser) {
        try {
          localStorage.setItem(KEY, choice);
        } catch {
          // private mode — the choice lives until reload
        }
      }
    });
  }

  set(choice: JtThemeChoice): void {
    this.choice.set(choice);
  }

  private read(): JtThemeChoice {
    if (!this.browser) {
      return 'auto';
    }
    try {
      const saved = localStorage.getItem(KEY);
      return saved === 'light' || saved === 'dark' ? saved : 'auto';
    } catch {
      return 'auto';
    }
  }
}
