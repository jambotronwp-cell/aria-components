import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { Observable } from 'rxjs';
import { JtAlertComponent } from '../alert/jt-alert.component';
import { JT_LABELS } from '../labels';
import { JtLoadingStateComponent } from '../state/jt-loading-state.component';
import { jtErrorText } from '../toast/jt-toast.service';

export interface JtConfirmData {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Dangerous action (delete, stop) — red button */
  danger?: boolean;
  /** Irreversible action — the button works only when this name is typed */
  confirmName?: string;
  /** Checkbox "Don't ask again"; storing the choice is up to the app (result 'always') */
  dontAsk?: boolean;
  /** Long action runs in the dialog: spinner instead of buttons, cannot be closed, error stays in the dialog */
  action?: () => Observable<unknown>;
}

/** true — confirmed, 'always' — confirmed with "Don't ask again", false — cancelled */
export type JtConfirmResult = boolean | 'always';

let nextId = 0;

/** Confirmation dialog — open with JtDialogService.confirm(). */
@Component({
  selector: 'jt-confirm-dialog',
  imports: [A11yModule, JtAlertComponent, JtLoadingStateComponent],
  template: `
    <form class="jt-dialog" (submit)="$event.preventDefault(); submit()">
      <h2 class="jt-dialog__title" [id]="titleId">{{ data.title ?? labels().confirm }}</h2>
      <p class="jt-confirm__message" [id]="messageId">{{ data.message }}</p>
      @if (error()) {
        <jt-alert tone="danger">{{ error() }}</jt-alert>
      }
      @if (data.confirmName !== undefined && !running()) {
        <p class="jt-confirm__type">{{ labels().typeName }} <strong class="jt-confirm__name">{{ data.confirmName }}</strong></p>
        <input class="jt-input" cdkFocusInitial autocomplete="off" spellcheck="false" [attr.aria-label]="labels().nameLabel"
               [value]="typed()" (input)="typed.set($any($event.target).value)">
      }
      @if (data.dontAsk && !running()) {
        <label class="jt-checkbox">
          <input type="checkbox" [checked]="dontAskAgain()" (change)="dontAskAgain.set($any($event.target).checked)">
          {{ labels().dontAsk }}
        </label>
      }
      @if (running()) {
        <jt-loading-state [message]="labels().running" />
      } @else {
        <div class="jt-dialog__actions">
          <button type="button" class="jt-button jt-button--outlined" (click)="ref.close(false)">{{ data.cancelLabel ?? labels().cancel }}</button>
          <button type="submit" class="jt-button jt-button--filled" [class.jt-button--danger]="data.danger" [disabled]="!canConfirm()"
                  [attr.cdkFocusInitial]="data.confirmName === undefined ? '' : null">
            {{ data.confirmLabel ?? labels().confirm }}
          </button>
        </div>
      }
    </form>
  `,
  styles: [`
    .jt-confirm__message { margin: 0; white-space: pre-line; }
    .jt-confirm__type { margin: 0; }
    .jt-confirm__name { font-family: var(--jt-font-mono, monospace); overflow-wrap: anywhere; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-labelledby]': 'titleId', '[attr.aria-describedby]': 'messageId' }
})
export class JtConfirmDialogComponent {
  protected readonly data = inject<JtConfirmData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<JtConfirmResult, JtConfirmDialogComponent>>(DialogRef);
  protected readonly labels = inject(JT_LABELS);

  protected readonly titleId = `jt-confirm-title-${nextId}`;
  protected readonly messageId = `jt-confirm-message-${nextId++}`;
  protected readonly typed = signal('');
  protected readonly dontAskAgain = signal(false);
  protected readonly running = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canConfirm = computed(() => !this.running() &&
    (this.data.confirmName === undefined || this.typed().trim() === this.data.confirmName));

  protected submit(): void {
    if (!this.canConfirm()) {
      return;
    }
    const result: JtConfirmResult = this.dontAskAgain() ? 'always' : true;
    if (!this.data.action) {
      this.ref.close(result);
      return;
    }
    this.running.set(true);
    this.error.set(null);
    this.ref.disableClose = true;
    this.data.action().subscribe({
      complete: () => this.ref.close(result),
      error: error => {
        this.running.set(false);
        this.ref.disableClose = false;
        this.error.set(jtErrorText(error));
      }
    });
  }
}
