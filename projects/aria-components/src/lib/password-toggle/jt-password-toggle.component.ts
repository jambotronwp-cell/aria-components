import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { JtIconComponent } from '../icon/jt-icon.component';
import { JT_LABELS } from '../labels';

/**
 * "Show password" button for a password or secret field: switches the `type` of the target input (do not bind [type]
 * there). A secret that is not a password (a URL with a token): give the field type="text" and [mask]="true" — the
 * class jt-masked hides the characters instead, so browsers do not offer saved passwords there.
 *
 * <input #secret class="jt-input" type="password"> <jt-password-toggle [target]="secret" />
 */
@Component({
  selector: 'jt-password-toggle',
  imports: [JtIconComponent],
  template: `
    <button type="button" class="jt-icon-button" (click)="toggle($event)"
            [attr.aria-label]="label() || labels().showPassword" [attr.aria-pressed]="shown()">
      <jt-icon [name]="shown() ? 'visibility' : 'visibility_off'" [size]="20" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'jt-password-toggle' }
})
export class JtPasswordToggleComponent {
  protected readonly labels = inject(JT_LABELS);
  readonly target = input.required<HTMLInputElement>();
  readonly mask = input(false);
  readonly label = input('');
  protected readonly shown = signal(false);

  constructor() {
    effect(() => {
      const target = this.target();
      if (this.mask()) {
        target.classList.toggle('jt-masked', !this.shown());
      } else {
        target.type = this.shown() ? 'text' : 'password';
      }
    });
  }

  protected toggle(event: MouseEvent): void {
    this.shown.update(shown => !shown);
    event.stopPropagation();
  }
}
