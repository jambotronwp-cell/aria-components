import { inject, Injectable, Type } from '@angular/core';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JtConfirmDialogComponent, JtConfirmData, JtConfirmResult } from './jt-confirm-dialog.component';

/**
 * Dialogs on CDK Dialog (focus trap, Esc, focus returns to the opener) with the glass surface of the theme.
 * Content — your component with `class="jt-dialog"` on the root (or use jt-confirm-dialog); data — inject(DIALOG_DATA).
 */
@Injectable({ providedIn: 'root' })
export class JtDialogService {
  private readonly dialog = inject(Dialog);

  open<R, D = unknown, C = unknown>(component: Type<C>, config: DialogConfig<D, DialogRef<R, C>> = {}): DialogRef<R, C> {
    return this.dialog.open<R, D, C>(component, {
      width: '480px',
      maxWidth: '92vw',
      ...config,
      panelClass: ['jt-dialog-panel', ...[config.panelClass ?? []].flat()],
      backdropClass: config.backdropClass ?? 'jt-dialog-backdrop'
    });
  }

  /**
   * Instead of window.confirm(): true — confirmed; false — cancel, Esc, click outside. With `confirmName` the button
   * waits until the name is typed; with `action` the work runs inside the dialog (spinner, error stays in the dialog).
   * 'always' from `result` — confirmed and "Don't ask again" ticked (`dontAsk: true`).
   */
  confirm(data: JtConfirmData): Observable<boolean> {
    return this.confirmWithResult(data).pipe(map(result => result === true || result === 'always'));
  }

  confirmWithResult(data: JtConfirmData): Observable<JtConfirmResult> {
    return this.open<JtConfirmResult, JtConfirmData, JtConfirmDialogComponent>(JtConfirmDialogComponent, {
      data, width: '420px', ariaModal: true, role: data.danger ? 'alertdialog' : 'dialog'
    }).closed.pipe(map(result => result ?? false));
  }
}
