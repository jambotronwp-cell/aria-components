import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { JtIconComponent } from '../icon/jt-icon.component';
import { JT_LABELS } from '../labels';
import { JtToastKind, JtToastService } from './jt-toast.service';

const ICONS = { success: 'check_circle', info: 'info', error: 'error' } as const;

/** Where the toasts show — added by JtToastService itself. Errors are announced assertively, the rest politely. */
@Component({
  selector: 'jt-toaster',
  imports: [JtIconComponent, NgTemplateOutlet],
  template: `
    <div class="jt-toaster__region" role="status" aria-live="polite">
      @for (toast of polite(); track toast.id) { <ng-container [ngTemplateOutlet]="item" [ngTemplateOutletContext]="{ $implicit: toast }" /> }
    </div>
    <div class="jt-toaster__region" role="alert" aria-live="assertive">
      @for (toast of urgent(); track toast.id) { <ng-container [ngTemplateOutlet]="item" [ngTemplateOutletContext]="{ $implicit: toast }" /> }
    </div>
    <ng-template #item let-toast>
      <div class="jt-toast" [class.jt-toast--error]="toast.kind === 'error'">
        <jt-icon class="jt-toast__icon" [name]="iconOf(toast.kind)" [size]="20" />
        <span class="jt-toast__message">{{ toast.message }}</span>
        @if (toast.action) {
          <button type="button" class="jt-button jt-toast__action" (click)="service.act(toast.id)">{{ toast.action }}</button>
        }
        <button type="button" class="jt-icon-button jt-toast__close" [attr.aria-label]="labels().close" (click)="service.dismiss(toast.id)">
          <jt-icon name="close" [size]="18" />
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { position: fixed; inset: auto 0 var(--jt-space-4, 16px) 0; z-index: 1100; display: flex; flex-direction: column;
      align-items: center; gap: var(--jt-space-2, 8px); padding: 0 var(--jt-space-4, 16px); pointer-events: none; }
    .jt-toaster__region { display: contents; }
    .jt-toast { pointer-events: auto; display: flex; align-items: center; gap: var(--jt-space-2, 8px); width: min(560px, 100%);
      box-sizing: border-box; padding: var(--jt-space-2, 8px) var(--jt-space-2, 8px) var(--jt-space-2, 8px) var(--jt-space-3, 12px);
      border-radius: var(--jt-radius-md, 10px); border: 1px solid var(--jt-glass-border, rgba(10, 16, 48, 0.12));
      background: var(--jt-glass-tint-strong, #eef2f7f2); backdrop-filter: var(--jt-glass-blur, blur(8px));
      -webkit-backdrop-filter: var(--jt-glass-blur, blur(8px)); box-shadow: var(--jt-shadow-lg, 0 16px 48px rgba(10, 16, 48, 0.2));
      color: var(--jt-text, inherit); animation: jt-toast-in var(--jt-duration-base, 250ms) var(--jt-easing, ease); }
    .jt-toast__icon { color: var(--jt-accent, currentColor); }
    .jt-toast--error { border-color: var(--jt-danger, #ef4444); }
    .jt-toast--error .jt-toast__icon, .jt-toast--error .jt-toast__action { color: var(--jt-danger-text, #8a1414); }
    .jt-toast__message { flex: 1; min-width: 0; overflow-wrap: anywhere; }
    .jt-toast__close { width: 32px; min-height: 32px; }
    @keyframes jt-toast-in { from { opacity: 0; transform: translateY(8px); } }
    @media (prefers-reduced-motion: reduce) { .jt-toast { animation: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'jt-toaster' }
})
export class JtToasterComponent {
  protected readonly service = inject(JtToastService);
  protected readonly labels = inject(JT_LABELS);
  protected iconOf(kind: JtToastKind): string {
    return ICONS[kind];
  }
  protected readonly polite = computed(() => this.service.toasts().filter(toast => toast.kind !== 'error'));
  protected readonly urgent = computed(() => this.service.toasts().filter(toast => toast.kind === 'error'));
}
