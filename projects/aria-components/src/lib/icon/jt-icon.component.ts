import { ChangeDetectionStrategy, Component, computed, inject, InjectionToken, input, Provider } from '@angular/core';

/** One stroke of an icon: an SVG path on a 24×24 grid; `fill` — a filled shape (dots), `opacity` — a faded stroke. */
export interface JtIconPath {
  d: string;
  fill?: boolean;
  opacity?: number;
}

export type JtIconDefinition = (string | JtIconPath)[];

function rect(x: number, y: number, w: number, h: number, r = 0): string {
  return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}` +
    `a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
}

function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0`;
}

const dot = (cx: number, cy: number, r = 1): JtIconPath => ({ d: circle(cx, cy, r), fill: true });

/**
 * Built-in icons — stroke 2, round caps, currentColor; drawn for this library (no icon font needed).
 * Names follow Material Symbols where there is one.
 */
export const JT_ICONS: Record<string, JtIconDefinition> = {
  // Common
  add: ['M12 5v14M5 12h14'],
  close: ['M6 6l12 12M18 6L6 18'],
  check: ['M5 12.5l4.5 4.5L19 7'],
  search: [circle(11, 11, 6), 'M20 20l-4.5-4.5'],
  refresh: ['M20 11a8 8 0 1 0-2.3 5.7', 'M20 5v6h-6'],
  delete: ['M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'],
  edit: ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'],
  download: ['M12 4v11M7 10l5 5 5-5M5 20h14'],
  upload: ['M12 20V9M7 14l5-5 5 5M5 4h14'],
  menu: ['M4 6h16M4 12h16M4 18h16'],
  more_vert: [dot(12, 5, 1.5), dot(12, 12, 1.5), dot(12, 19, 1.5)],
  chevron_left: ['M15 6l-6 6 6 6'],
  chevron_right: ['M9 6l6 6-6 6'],
  expand_more: ['M6 9l6 6 6-6'],
  expand_less: ['M6 15l6-6 6 6'],
  open_in_new: ['M14 4h6v6M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'],
  copy: [rect(8, 8, 12, 12, 2), 'M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3'],
  visibility: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', circle(12, 12, 3)],
  visibility_off: ['M3 3l18 18', 'M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.8M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'],
  // States
  info: [circle(12, 12, 9), 'M12 11v6', dot(12, 7.5)],
  warning: ['M12 3l10 18H2z', 'M12 10v5', dot(12, 18)],
  error: [circle(12, 12, 9), 'M12 7v6', dot(12, 16.5)],
  check_circle: [circle(12, 12, 9), 'M8 12.5l3 3 5-6'],
  inbox: ['M3 13l3-8h12l3 8v6H3z', 'M3 13h5l1 3h6l1-3h5'],
  notifications: ['M6 16V11a6 6 0 0 1 12 0v5l2 2H4z', 'M10 21h4'],
  // Theme
  light_mode: [circle(12, 12, 4), 'M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
  dark_mode: ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z'],
  contrast: [circle(12, 12, 9), { d: 'M12 3a9 9 0 0 1 0 18z', fill: true }],
  // Text formatting (Markdown editor)
  title: ['M6 5v14M18 5v14M6 12h12'],
  format_bold: ['M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z'],
  format_italic: ['M10 5h8M6 19h8M14 5l-4 14'],
  format_strikethrough: ['M4 12h16M16 6.5C15 5.5 13.6 5 12 5c-2.5 0-4.5 1.3-4.5 3.3M8 17.5c1 1 2.4 1.5 4 1.5 2.5 0 4.5-1.3 4.5-3.3'],
  code: ['M9 7l-5 5 5 5M15 7l5 5-5 5'],
  code_blocks: [rect(3, 4, 18, 16, 2), 'M10 9l-3 3 3 3M14 9l3 3-3 3'],
  link: ['M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1', 'M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1'],
  image: [rect(3, 4, 18, 16, 2), circle(9, 10, 2), 'M21 16l-5-5-9 9'],
  format_quote: ['M5 5v14M9 8h10M9 12h10M9 16h6'],
  format_list_bulleted: ['M9 6h11M9 12h11M9 18h11', dot(4.5, 6), dot(4.5, 12), dot(4.5, 18)],
  format_list_numbered: ['M10 6h10M10 12h10M10 18h10M4 4.5l1.5-.5v4.5M3.8 14c.4-.7 2.4-.9 2.4.5 0 .9-2.4 1.7-2.4 3H6.4'],
  checklist: [rect(3, 4, 6, 6, 1), 'M4.5 7l1.2 1.2L8 5.8M12 7h9M12 17h9', rect(3, 14, 6, 6, 1)],
  table: [rect(3, 4, 18, 16, 2), 'M3 10h18M3 15h18M9 4v16M15 4v16'],
  functions: ['M18 5H6l6 7-6 7h12'],
  horizontal_rule: ['M3 12h18', { d: 'M6 7h12M6 17h12', opacity: 0.35 }]
};

/** Extra icons of the app: provideJtIcons({ rocket: ['M…'] }). Same name — the app's icon wins. */
export const JT_EXTRA_ICONS = new InjectionToken<Record<string, JtIconDefinition>[]>('JT_EXTRA_ICONS');

export function provideJtIcons(icons: Record<string, JtIconDefinition>): Provider {
  return { provide: JT_EXTRA_ICONS, useValue: icons, multi: true };
}

/**
 * Icon font for names that are not among the SVG icons: provideJtIconFont('material-icons') — then
 * <jt-icon name="rocket_launch" /> renders <span class="material-icons">rocket_launch</span> (ligature fonts:
 * Material Icons, Material Symbols). The app loads the font itself.
 */
export const JT_ICON_FONT = new InjectionToken<string>('JT_ICON_FONT');

export function provideJtIconFont(fontClass: string): Provider {
  return { provide: JT_ICON_FONT, useValue: fontClass };
}

/**
 * Icon: <jt-icon name="check" />. Decorative by default (aria-hidden); with `label` — role="img" and the label.
 * Size — `size` (px) or CSS `--jt-icon-size`; color — currentColor.
 */
@Component({
  selector: 'jt-icon',
  template: `
    @if (fontIcon(); as font) {
      <span [class]="font" aria-hidden="true">{{ name() }}</span>
    } @else {
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         focusable="false" aria-hidden="true">
      @for (path of paths(); track $index) {
        <path [attr.d]="path.d" [attr.fill]="path.fill ? 'currentColor' : null" [attr.stroke]="path.fill ? 'none' : null"
              [attr.opacity]="path.opacity ?? null" />
      }
    </svg>
    }
  `,
  styles: [`
    :host { display: inline-flex; flex: none; width: var(--jt-icon-size, 24px); height: var(--jt-icon-size, 24px); line-height: 0; }
    svg { width: 100%; height: 100%; }
    span { font-size: var(--jt-icon-size, 24px); width: 100%; height: 100%; line-height: 1; overflow: hidden; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'jt-icon',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[style.--jt-icon-size]': 'size() ? size() + "px" : null'
  }
})
export class JtIconComponent {
  private readonly extra = inject(JT_EXTRA_ICONS, { optional: true }) ?? [];
  private readonly font = inject(JT_ICON_FONT, { optional: true });

  readonly name = input.required<string>();
  readonly label = input('');
  readonly size = input<number | null>(null);

  private readonly definition = computed<JtIconDefinition | undefined>(() => {
    const name = this.name();
    return [...this.extra].reverse().find(icons => icons[name])?.[name] ?? JT_ICONS[name];
  });

  /** The font class when the name has no SVG icon and an icon font is provided */
  protected readonly fontIcon = computed(() => this.definition() ? null : this.font);

  protected readonly paths = computed<JtIconPath[]>(() =>
    (this.definition() ?? []).map(path => typeof path === 'string' ? { d: path } : path));
}
