import {
  ApplicationRef, createComponent, EnvironmentInjector, inject, Injectable, PLATFORM_ID, signal, WritableSignal
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { catchError, defer, EMPTY, finalize, Observable, Subject, tap } from 'rxjs';
import { JtToasterComponent } from './jt-toaster.component';

export type JtToastKind = 'success' | 'info' | 'error';

export interface JtToast {
  id: number;
  kind: JtToastKind;
  message: string;
  action?: string;
}

export interface JtToastRef {
  dismiss(): void;
  /** Emits once when the action button is pressed */
  readonly onAction: Observable<void>;
}

const DURATION: Record<JtToastKind, number> = { success: 3000, info: 4000, error: 8000 };

/** Text of an HTTP or any other error: server message, else the error's own message. */
export function jtErrorText(error: unknown): string {
  const e = error as { error?: { message?: unknown } | string; message?: unknown } | null;
  if (e && typeof e.error === 'object' && typeof e.error?.message === 'string') {
    return e.error.message;
  }
  if (e && typeof e.error === 'string' && e.error) {
    return e.error;
  }
  return typeof e?.message === 'string' ? e.message : String(error);
}

/**
 * Toasts: success / info disappear by themselves, errors stay longer and have a button. The toaster (an aria-live
 * region, bottom of the screen) is added to <body> on the first toast — nothing to place in templates.
 */
@Injectable({ providedIn: 'root' })
export class JtToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly actions = new Map<number, Subject<void>>();
  private nextId = 1;
  private mounted = false;

  /** Toasts on screen, oldest first (the toaster reads it). */
  readonly toasts = signal<JtToast[]>([]);
  /** At most this many at once; the oldest goes first. */
  max = 3;

  success(message: string): JtToastRef {
    return this.show('success', message);
  }

  info(message: string): JtToastRef {
    return this.show('info', message);
  }

  error(message: string, action = 'OK'): JtToastRef {
    return this.show('error', message, action);
  }

  /**
   * A quick action: busy is true while the request runs; success — `done` toast (null — none), failure — the error
   * text, prefixed with `failed`. The error does not go further: the subscriber only gets success.
   */
  action<T>(request: Observable<T>, done: string | null, busy?: WritableSignal<boolean>, failed?: string): Observable<T> {
    return defer(() => {
      busy?.set(true);
      return request.pipe(
        tap(() => {
          if (done) {
            this.success(done);
          }
        }),
        catchError(error => {
          this.error(failed ? `${failed}: ${jtErrorText(error)}` : jtErrorText(error));
          return EMPTY;
        }),
        finalize(() => busy?.set(false))
      );
    });
  }

  show(kind: JtToastKind, message: string, action?: string, duration = DURATION[kind]): JtToastRef {
    const id = this.nextId++;
    const onAction = new Subject<void>();
    this.actions.set(id, onAction);
    this.toasts.update(list => [...list, { id, kind, message, action }].slice(-this.max));
    this.mount();
    if (duration > 0 && this.browser) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return { dismiss: () => this.dismiss(id), onAction: onAction.asObservable() };
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(toast => toast.id !== id));
    this.actions.get(id)?.complete();
    this.actions.delete(id);
  }

  /** The action button of a toast (toaster calls it). */
  act(id: number): void {
    this.actions.get(id)?.next();
    this.dismiss(id);
  }

  private mount(): void {
    if (this.mounted || !this.browser) {
      return;
    }
    this.mounted = true;
    const ref = createComponent(JtToasterComponent, { environmentInjector: this.injector });
    this.appRef.attachView(ref.hostView);
    this.document.body.appendChild(ref.location.nativeElement);
  }
}
