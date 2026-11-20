import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { JtIconComponent } from '../icon/jt-icon.component';
import { JT_LABELS } from '../labels';

/** Empty list: icon, title, text; action buttons — content. Without `message` — labels.empty. */
@Component({
  selector: 'jt-empty-state',
  imports: [JtIconComponent],
  template: `
    <jt-icon class="jt-empty-state__icon" [name]="icon()" [size]="48" />
    @if (title(); as title) {
      <h3 class="jt-empty-state__title">{{ title }}</h3>
    }
    <p class="jt-empty-state__message jt-muted">{{ text() }}</p>
    <div class="jt-empty-state__actions"><ng-content /></div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; align-items: center; gap: var(--jt-space-2, 8px); padding: var(--jt-space-6, 32px) var(--jt-space-4, 16px); text-align: center; }
    .jt-empty-state__icon { color: var(--jt-text-muted, currentColor); opacity: 0.7; }
    .jt-empty-state__title { margin: 0; font-size: var(--jt-fs-lg, 1.125rem); }
    .jt-empty-state__message { margin: 0; max-width: 40ch; }
    .jt-empty-state__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--jt-space-2, 8px); margin-top: var(--jt-space-2, 8px); }
    .jt-empty-state__actions:empty { display: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'jt-empty-state' }
})
export class JtEmptyStateComponent {
  private readonly labels = inject(JT_LABELS);
  readonly icon = input('inbox');
  readonly title = input<string>();
  readonly message = input<string>();
  protected readonly text = computed(() => this.message() ?? this.labels().empty);
}
