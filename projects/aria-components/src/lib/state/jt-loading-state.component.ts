import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { JT_LABELS } from '../labels';
import { JtSpinnerComponent } from './jt-spinner.component';

/** Loading of a block or a page: spinner and text (role="status"); without `message` — labels.loading. */
@Component({
  selector: 'jt-loading-state',
  imports: [JtSpinnerComponent],
  template: `<jt-spinner [diameter]="diameter()" /><span class="jt-muted">{{ text() }}</span>`,
  styles: [`:host { display: flex; align-items: center; justify-content: center; gap: var(--jt-space-3, 12px); padding: var(--jt-space-5, 24px); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'jt-loading-state', role: 'status', 'aria-live': 'polite' }
})
export class JtLoadingStateComponent {
  private readonly labels = inject(JT_LABELS);
  readonly message = input<string>();
  readonly diameter = input(32);
  protected readonly text = computed(() => this.message() ?? this.labels().loading);
}
