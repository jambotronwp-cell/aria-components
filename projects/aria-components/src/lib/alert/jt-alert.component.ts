import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JtIconComponent } from '../icon/jt-icon.component';

export type JtAlertTone = 'info' | 'success' | 'warning' | 'danger';

const ICONS: Record<JtAlertTone, string> = { info: 'info', success: 'check_circle', warning: 'warning', danger: 'error' };

/**
 * A message inside a page or a dialog: <jt-alert tone="warning">Text</jt-alert>. Danger and warning are announced
 * (role="alert"), info and success are polite (role="status").
 */
@Component({
  selector: 'jt-alert',
  imports: [JtIconComponent],
  template: `<jt-icon [name]="icon()" [size]="20" /><span><ng-content /></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"jt-alert jt-alert--" + tone()',
    '[attr.role]': 'tone() === "danger" || tone() === "warning" ? "alert" : "status"'
  }
})
export class JtAlertComponent {
  readonly tone = input<JtAlertTone>('info');
  protected readonly icon = computed(() => ICONS[this.tone()]);
}
