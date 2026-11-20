import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { JT_LABELS } from '../labels';

/** Four colors: working, in progress / attention, error, off. Plus accent and info — for labels that are not states. */
export type JtTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'accent';

/** Typical statuses (projects, containers, VMs, deployments, jobs) → tone; case-insensitive. Extend with `tones`. */
export const JT_STATUS_TONES: Record<string, JtTone> = {
  running: 'success', active: 'success', success: 'success', succeeded: 'success', completed: 'success',
  ready: 'success', healthy: 'success', up: 'success', ok: 'success',
  pending: 'warning', queued: 'warning', preparing: 'warning', provisioning: 'warning', deploying: 'warning',
  creating: 'warning', starting: 'warning', restarting: 'warning', stopping: 'warning', paused: 'warning',
  draining: 'warning', degraded: 'warning',
  failed: 'danger', error: 'danger', unhealthy: 'danger', unreachable: 'danger', unavailable: 'danger', down: 'danger',
  stopped: 'neutral', disabled: 'neutral', deleted: 'neutral', unknown: 'neutral'
};

// Alive and healthy — the dot "breathes"; finished jobs (success, completed) — a calm dot
const LIVE = new Set(['running', 'active', 'healthy', 'ready', 'up']);

/** live — breathes, busy — blinks, alarm — shakes once on appear, still — no motion */
export type JtBadgeMotion = 'live' | 'busy' | 'alarm' | 'still';

/**
 * Status badge: <jt-badge status="running" />. Tone — by status or `tone`; text — `label`, else the status;
 * tooltip (title) — `hint`, else the meaning of the color. A dot of the badge color before the text (not for neutral);
 * motion of the dot by tone, still with prefers-reduced-motion.
 */
@Component({
  selector: 'jt-badge',
  template: `
    @if (resolvedTone() !== 'neutral' && dot()) {
      <span class="jt-badge__dot" [class]="'jt-badge__dot jt-badge__dot--' + motion()" aria-hidden="true"></span>
    }
    {{ label() ?? status() }}
  `,
  styles: [`
    /* the plain .jt-badge class draws a static dot; this component draws its own (with motion) */
    :host::before { content: none; }
    .jt-badge__dot {
      position: relative; display: inline-block; flex: none; width: 6px; height: 6px; margin-inline-end: 6px;
      border-radius: 50%; background: currentColor; vertical-align: middle;
    }
    .jt-badge__dot--live::after {
      content: ''; position: absolute; inset: 0; border-radius: 50%; background: currentColor; opacity: 0;
    }
    @media (prefers-reduced-motion: no-preference) {
      .jt-badge__dot--live::after { animation: jt-badge-ping 2.4s ease-out infinite; }
      .jt-badge__dot--busy { animation: jt-badge-blink 1.2s ease-in-out infinite; }
      .jt-badge__dot--alarm { animation: jt-badge-shake 400ms ease-in-out 2; }
    }
    @keyframes jt-badge-ping { 0% { transform: scale(1); opacity: 0.55; } 70%, 100% { transform: scale(2.8); opacity: 0; } }
    @keyframes jt-badge-blink { 50% { opacity: 0.3; } }
    @keyframes jt-badge-shake { 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"jt-badge jt-badge--" + resolvedTone()',
    '[attr.title]': 'title()'
  }
})
export class JtBadgeComponent {
  private readonly labels = inject(JT_LABELS);

  readonly status = input('');
  readonly label = input<string>();
  readonly tone = input<JtTone>();
  readonly hint = input<string>();
  readonly dot = input(true);
  /** Extra status → tone pairs of the app */
  readonly tones = input<Record<string, JtTone>>({});

  protected readonly key = computed(() => (this.status() ?? '').toLowerCase());

  protected readonly resolvedTone = computed<JtTone>(() =>
    this.tone() ?? this.tones()[this.key()] ?? JT_STATUS_TONES[this.key()] ?? 'neutral');

  protected readonly motion = computed<JtBadgeMotion>(() => {
    const tone = this.resolvedTone();
    if (tone === 'danger') {
      return 'alarm';
    }
    if (tone === 'warning') {
      return 'busy';
    }
    return tone === 'success' && LIVE.has(this.key()) ? 'live' : 'still';
  });

  protected readonly title = computed(() => {
    if (this.hint()) {
      return this.hint();
    }
    const labels = this.labels();
    switch (this.resolvedTone()) {
      case 'success': return labels.toneSuccess;
      case 'warning': return labels.toneWarning;
      case 'danger': return labels.toneDanger;
      case 'neutral': return labels.toneNeutral;
      default: return null;
    }
  });
}
