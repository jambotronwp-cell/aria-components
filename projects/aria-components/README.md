# @jambotron/aria-components

UI components for Angular 22 on [Angular Aria](https://angular.dev/guide/aria/overview) and CDK — **no Angular Material**.
Light and dark theme out of the box, everything accessible from the keyboard and screen readers.

| | |
| --- | --- |
| **Theme** | `--jt-*` tokens, light + dark (system, or `JtThemeService` / `<jt-theme-toggle>`) |
| `<jt-icon>` | 43 built-in SVG icons (Material Symbols names), your own via `provideJtIcons()`, any other name from your icon font via `provideJtIconFont()` |
| `<jt-badge>` | status badge: tone by status (`running`, `failed`…), live / busy / alarm dot |
| `.jt-button` | filled, outlined, text, danger, icon button — plain CSS classes |
| `JtDialogService` | dialogs on CDK Dialog; `confirm()` — type-the-name, "don't ask again", long action inside the dialog |
| `JtToastService` | toasts with action button, aria-live; `action()` — request + busy flag + success / error toast |
| `<jt-tabs>` | Aria tabs from `<ng-template jtTab>` — no repeated markup |
| `<jt-alert>` | info / success / warning / danger message |
| `<jt-loading-state>`, `<jt-spinner>`, `<jt-empty-state>` | loading and empty lists |
| `<jt-password-toggle>` | show / hide a password or a secret field |
| CSS classes | `.jt-panel`, `.jt-card`, `.jt-tablist`, `.jt-segmented`, `.jt-popup`, `.jt-menu-item`, `.jt-input`, `.jt-table`… |

## Install

```bash
npm install @jambotron/aria-components
```

Peer dependencies: Angular 22 (`core`, `common`), `@angular/aria`, `@angular/cdk`, `rxjs`.

```scss
// styles.scss — tokens, classes, CDK overlay
@use '@jambotron/aria-components/styles/aria-components';
// or tokens only: @use '@jambotron/aria-components/styles/theme';
```

## Use

```ts
@Component({
  imports: [JtBadgeComponent, JtTabsComponent, JtTabDirective, JtIconComponent],
  template: `
    <jt-badge [status]="project.status" />
    <button class="jt-button jt-button--filled jt-button--danger" (click)="remove()">
      <jt-icon name="delete" [size]="18" /> Delete
    </button>
    <jt-tabs [(selected)]="tab">
      <ng-template jtTab="overview" label="Overview">…</ng-template>
      <ng-template jtTab="logs" label="Logs">…</ng-template>
    </jt-tabs>
  `
})
export class ProjectPage {
  private readonly dialogs = inject(JtDialogService);
  private readonly toasts = inject(JtToastService);

  remove() {
    this.dialogs.confirm({ message: 'Delete the project?', danger: true, confirmName: this.project.name,
      action: () => this.api.delete(this.project.id) })
      .subscribe(done => done && this.toasts.success('Deleted'));
  }
}
```

Own dialog: `dialogs.open(MyDialog, { data })` — put `class="jt-dialog"` on its root, read data with `inject(DIALOG_DATA)`,
close with `inject(DialogRef).close(result)`.

## Icons

43 SVG icons are built in. Add your own SVG paths, or let names without an SVG icon come from an icon font you
already load (ligature fonts: Material Icons, Material Symbols):

```ts
providers: [
  provideJtIcons({ rocket: ['M12 2c3 3 4 7 3 11l-3 3-3-3c-1-4 0-8 3-11z'] }),
  provideJtIconFont('material-icons')        // <jt-icon name="cloud_off" /> → the font's glyph
]
```

## Labels

English by default; any language — a function read on every change detection:

```ts
providers: [provideJtLabels(() => ({ cancel: t('cancel'), confirm: t('confirm'), loading: t('loading') }))]
```

## Theme

All colors, radii, spacing, fonts and durations are `--jt-*` CSS variables on `:where(:root)` (zero specificity —
your values win). Dark theme: `[data-theme='dark']` on `<html>`, or the system setting when there is no `data-theme`.

## Develop

```bash
npm ci
npx ng test aria-components --watch=false
npx ng serve playground
npx ng build aria-components        # → dist/aria-components
cd dist/aria-components && npm publish
```

License: [MIT](LICENSE) © Jambotron. Made for and deployed on [jambotron.com](https://jambotron.com).
