import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';
import { JtIconComponent } from '../icon/jt-icon.component';
import { JT_LABELS } from '../labels';
import { JtThemeChoice, JtThemeService } from './jt-theme.service';

/** Auto / Light / Dark — a segmented switch (Aria listbox, arrow keys). `compact` — icons only. */
@Component({
  selector: 'jt-theme-toggle',
  imports: [Listbox, Option, JtIconComponent],
  template: `
    <div ngListbox class="jt-segmented" orientation="horizontal" selectionMode="follow" [attr.aria-label]="labels().theme"
         [value]="[service.choice()]" (valueChange)="$event[0] && service.set($event[0])">
      @for (option of options(); track option.value) {
        <div ngOption class="jt-segment" [value]="option.value" [label]="option.label" [attr.title]="compact() ? option.label : null">
          <jt-icon [name]="option.icon" [size]="18" />
          @if (!compact()) {
            <span>{{ option.label }}</span>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'jt-theme-toggle' }
})
export class JtThemeToggleComponent {
  protected readonly service = inject(JtThemeService);
  protected readonly labels = inject(JT_LABELS);
  readonly compact = input(false);

  protected readonly options = computed<{ value: JtThemeChoice; label: string; icon: string }[]>(() => {
    const labels = this.labels();
    return [
      { value: 'auto', label: labels.themeAuto, icon: 'contrast' },
      { value: 'light', label: labels.themeLight, icon: 'light_mode' },
      { value: 'dark', label: labels.themeDark, icon: 'dark_mode' }
    ];
  });
}
