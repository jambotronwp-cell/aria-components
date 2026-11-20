import {
  ChangeDetectionStrategy, Component, contentChildren, Directive, inject, input, linkedSignal, model, TemplateRef
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';

/** One tab: <ng-template jtTab="logs" label="Logs">…content…</ng-template>. Content is created when the tab opens. */
@Directive({ selector: 'ng-template[jtTab]' })
export class JtTabDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  readonly value = input.required<string>({ alias: 'jtTab' });
  readonly label = input.required<string>();
  readonly disabled = input(false);
}

/**
 * Tabs on Angular Aria (`ngTabs`): arrow keys between tabs, Home / End, roles and ids — without repeating the markup
 * on every page. Selected tab — [(selected)], first by default.
 *
 * <jt-tabs [(selected)]="tab">
 *   <ng-template jtTab="overview" label="Overview">…</ng-template>
 *   <ng-template jtTab="logs" label="Logs">…</ng-template>
 * </jt-tabs>
 */
@Component({
  selector: 'jt-tabs',
  imports: [Tabs, TabList, Tab, TabPanel, TabContent, NgTemplateOutlet],
  template: `
    <div ngTabs>
      <ul ngTabList class="jt-tablist" [attr.aria-label]="label() || null" [selectedTab]="current()" (selectedTabChange)="select($event)">
        @for (tab of tabs(); track tab.value()) {
          <li ngTab class="jt-tab" [value]="tab.value()" [disabled]="tab.disabled()">{{ tab.label() }}</li>
        }
      </ul>
      @for (tab of tabs(); track tab.value()) {
        <div ngTabPanel class="jt-tabpanel" [value]="tab.value()">
          <ng-template ngTabContent>
            <ng-container [ngTemplateOutlet]="tab.template" />
          </ng-template>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'jt-tabs' }
})
export class JtTabsComponent {
  protected readonly tabs = contentChildren(JtTabDirective);
  readonly selected = model<string | undefined>(undefined);
  readonly label = input('');

  // Shown tab: [(selected)], or the first one
  protected readonly current = linkedSignal<string | undefined>(() => this.selected() ?? this.tabs()[0]?.value());

  protected select(value: string | undefined): void {
    this.current.set(value);
    if (value !== undefined && value !== this.selected()) {
      this.selected.set(value);
    }
  }
}
