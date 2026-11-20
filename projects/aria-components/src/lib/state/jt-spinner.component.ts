import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Indeterminate spinner (decorative — put the text next to it, or use jt-loading-state). */
@Component({
  selector: 'jt-spinner',
  template: `<svg viewBox="0 0 50 50" aria-hidden="true" focusable="false"><circle cx="25" cy="25" r="20" /></svg>`,
  styles: [`
    :host { display: inline-flex; width: var(--_size); height: var(--_size); color: var(--jt-accent, currentColor); }
    svg { width: 100%; height: 100%; animation: jt-spin 1.4s linear infinite; }
    circle { fill: none; stroke: currentColor; stroke-width: 5; stroke-linecap: round; stroke-dasharray: 90 150; stroke-dashoffset: 0;
      animation: jt-dash 1.4s ease-in-out infinite; }
    @keyframes jt-spin { to { transform: rotate(360deg); } }
    @keyframes jt-dash { 0% { stroke-dasharray: 1 150; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90 150; stroke-dashoffset: -35; }
      100% { stroke-dasharray: 90 150; stroke-dashoffset: -124; } }
    @media (prefers-reduced-motion: reduce) { svg { animation-duration: 4s; } circle { animation: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'jt-spinner', '[style.--_size]': 'diameter() + "px"', 'aria-hidden': 'true' }
})
export class JtSpinnerComponent {
  readonly diameter = input(32);
}
