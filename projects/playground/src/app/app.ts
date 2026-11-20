import { Component, inject, signal } from '@angular/core';
import { timer } from 'rxjs';
import {
  JT_ICONS, JtAlertComponent, JtBadgeComponent, JtDialogService, JtEmptyStateComponent, JtIconComponent,
  JtLoadingStateComponent, JtPasswordToggleComponent, JtSpinnerComponent, JtTabDirective, JtTabsComponent,
  JtThemeToggleComponent, JtToastService
} from '@jambotron/aria-components';

@Component({
  selector: 'app-root',
  imports: [JtAlertComponent, JtBadgeComponent, JtEmptyStateComponent, JtIconComponent, JtLoadingStateComponent,
    JtPasswordToggleComponent, JtSpinnerComponent, JtTabDirective, JtTabsComponent, JtThemeToggleComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly toasts = inject(JtToastService);
  protected readonly dialogs = inject(JtDialogService);
  protected readonly icons = Object.keys(JT_ICONS);
  protected readonly statuses = ['running', 'deploying', 'failed', 'stopped', 'completed'];
  protected readonly tab = signal<string | undefined>(undefined);
  protected readonly answer = signal('');

  protected confirm(): void {
    this.dialogs.confirm({ title: 'Delete project', message: 'This removes the project and its volumes.', danger: true,
      confirmName: 'demo-shop', confirmLabel: 'Delete', action: () => timer(1200) })
      .subscribe(ok => this.answer.set(ok ? 'deleted' : 'cancelled'));
  }
}
