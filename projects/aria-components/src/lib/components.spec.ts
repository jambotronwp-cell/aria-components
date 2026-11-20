import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { JtBadgeComponent } from './badge/jt-badge.component';
import { JtDialogService } from './dialog/jt-dialog.service';
import { JtIconComponent, provideJtIconFont, provideJtIcons } from './icon/jt-icon.component';
import { provideJtLabels } from './labels';
import { JtPasswordToggleComponent } from './password-toggle/jt-password-toggle.component';
import { JtEmptyStateComponent } from './state/jt-empty-state.component';
import { JtTabDirective, JtTabsComponent } from './tabs/jt-tabs.component';
import { JtThemeService } from './theme/jt-theme.service';
import { JtToastService } from './toast/jt-toast.service';

const tick = () => new Promise(resolve => setTimeout(resolve));

describe('JtIconComponent', () => {
  it('draws built-in and app icons, decorative unless labelled', () => {
    TestBed.configureTestingModule({ providers: [provideJtIcons({ rocket: ['M1 1h2'] })] });
    const fixture = TestBed.createComponent(JtIconComponent);
    fixture.componentRef.setInput('name', 'more_vert');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('path').length).toBe(3);
    expect(host.getAttribute('aria-hidden')).toBe('true');

    fixture.componentRef.setInput('name', 'rocket');
    fixture.componentRef.setInput('label', 'Launch');
    fixture.detectChanges();
    expect(host.querySelector('path')?.getAttribute('d')).toBe('M1 1h2');
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Launch');
  });

  it('falls back to the icon font for names without an SVG icon', () => {
    TestBed.configureTestingModule({ providers: [provideJtIconFont('material-icons')] });
    const fixture = TestBed.createComponent(JtIconComponent);
    fixture.componentRef.setInput('name', 'rocket_launch');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const span = host.querySelector('span.material-icons');
    expect(span?.textContent?.trim()).toBe('rocket_launch');
    expect(host.querySelector('svg')).toBeNull();

    fixture.componentRef.setInput('name', 'check');
    fixture.detectChanges();
    expect(host.querySelector('svg path')).not.toBeNull();
    expect(host.querySelector('span')).toBeNull();
  });
});

describe('JtBadgeComponent', () => {
  it('picks the tone and the motion by status', () => {
    const fixture = TestBed.createComponent(JtBadgeComponent);
    fixture.componentRef.setInput('status', 'RUNNING');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('jt-badge--success');
    expect(host.querySelector('.jt-badge__dot--live')).not.toBeNull();
    expect(host.textContent?.trim()).toBe('RUNNING');

    fixture.componentRef.setInput('status', 'failed');
    fixture.componentRef.setInput('label', 'Broken');
    fixture.detectChanges();
    expect(host.classList).toContain('jt-badge--danger');
    expect(host.getAttribute('title')).toBe('Error');
    expect(host.textContent?.trim()).toBe('Broken');

    fixture.componentRef.setInput('status', 'parked');
    fixture.componentRef.setInput('tones', { parked: 'info' });
    fixture.detectChanges();
    expect(host.classList).toContain('jt-badge--info');
  });
});

describe('JtEmptyStateComponent', () => {
  it('uses the app labels', () => {
    TestBed.configureTestingModule({ providers: [provideJtLabels({ empty: 'Nothing yet' })] });
    const fixture = TestBed.createComponent(JtEmptyStateComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nothing yet');
  });
});

describe('JtToastService', () => {
  afterEach(() => document.querySelectorAll('jt-toaster').forEach(el => el.remove()));

  it('shows toasts in the toaster, errors assertively, with action and dismiss', async () => {
    const toasts = TestBed.inject(JtToastService);
    toasts.success('Saved');
    const ref = toasts.error('Broken', 'Retry');
    let acted = false;
    ref.onAction.subscribe(() => acted = true);
    TestBed.tick();

    const toaster = document.querySelector('jt-toaster') as HTMLElement;
    expect(toaster.querySelector('[role="status"]')?.textContent).toContain('Saved');
    expect(toaster.querySelector('[role="alert"]')?.textContent).toContain('Broken');

    (toaster.querySelector('.jt-toast__action') as HTMLButtonElement).click();
    TestBed.tick();
    expect(acted).toBe(true);
    expect(toasts.toasts().map(t => t.message)).toEqual(['Saved']);
  });

  it('action(): busy while running, error text with prefix', async () => {
    const toasts = TestBed.inject(JtToastService);
    const busy = signal(false);
    toasts.action(throwError(() => ({ error: { message: 'quota exceeded' } })), 'Done', busy, 'Upload failed').subscribe();
    expect(busy()).toBe(false);
    expect(toasts.toasts().at(-1)?.message).toBe('Upload failed: quota exceeded');
  });
});

describe('JtDialogService.confirm', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove()));

  async function open(data: Parameters<JtDialogService['confirm']>[0]) {
    let result: boolean | undefined;
    TestBed.inject(JtDialogService).confirm(data).subscribe(value => result = value);
    TestBed.tick();
    await tick();
    const dialog = document.querySelector('jt-confirm-dialog') as HTMLElement;
    return { dialog, result: () => result };
  }

  it('waits for the typed name before confirming', async () => {
    const { dialog, result } = await open({ message: 'Delete?', confirmName: 'prod-db', danger: true });
    const confirm = dialog.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);

    const input = dialog.querySelector('input.jt-input') as HTMLInputElement;
    input.value = 'prod-db';
    input.dispatchEvent(new Event('input'));
    TestBed.tick();
    expect(confirm.disabled).toBe(false);
    confirm.click();
    TestBed.tick();
    await tick();
    expect(result()).toBe(true);
  });

  it('cancel gives false', async () => {
    const { dialog, result } = await open({ message: 'Stop?' });
    (dialog.querySelector('.jt-button--outlined') as HTMLButtonElement).click();
    await tick();
    expect(result()).toBe(false);
  });

  it('keeps the dialog open with the error when the action fails', async () => {
    const { dialog, result } = await open({ message: 'Run?', action: () => throwError(() => new Error('nope')) });
    (dialog.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    TestBed.tick();
    await tick();
    TestBed.tick();
    expect(dialog.querySelector('jt-alert')?.textContent).toContain('nope');
    expect(result()).toBeUndefined();
  });
});

@Component({
  imports: [JtTabsComponent, JtTabDirective],
  template: `
    <jt-tabs [(selected)]="tab" label="Sections">
      <ng-template jtTab="one" label="One"><p class="content">first</p></ng-template>
      <ng-template jtTab="two" label="Two"><p class="content">second</p></ng-template>
    </jt-tabs>
  `
})
class TabsHost {
  readonly tab = signal<string | undefined>(undefined);
}

describe('JtTabsComponent', () => {
  it('shows the first tab, switches on click and reports the selection', async () => {
    const fixture = TestBed.createComponent(TabsHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const tabs = host.querySelectorAll<HTMLElement>('[role="tab"]');
    expect(tabs.length).toBe(2);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(host.querySelector('[role="tabpanel"]:not([inert]) .content')?.textContent).toBe('first');

    tabs[1].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    tabs[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.tab()).toBe('two');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });
});

describe('JtThemeService', () => {
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('sets data-theme for light/dark and removes it for auto', () => {
    const theme = TestBed.inject(JtThemeService);
    theme.set('dark');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(theme.theme()).toBe('dark');
    theme.set('auto');
    TestBed.tick();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

@Component({
  imports: [JtPasswordToggleComponent],
  template: `<input #field type="password" value="secret"><jt-password-toggle [target]="field" />`
})
class PasswordHost {}

describe('JtPasswordToggleComponent', () => {
  it('switches the input type', () => {
    const fixture = TestBed.createComponent(PasswordHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('input') as HTMLInputElement;
    const button = host.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });
});
