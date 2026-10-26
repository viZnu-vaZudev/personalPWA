import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';
@Component({
  selector: 'app-header',
  template: `<header class="page-heading">
    <div>
      <p class="eyebrow">{{ eyebrow() }}</p>
      <h1>{{ title() }}</h1>
      <p class="subtitle">{{ subtitle() }}</p>
    </div>
    <ng-content />
  </header>`,
})
export class PageHeader {
  title = input('');
  subtitle = input('');
  eyebrow = input('MYCOMPASS');
}
@Component({
  selector: 'app-empty',
  template: `<div class="empty">
    <h2>{{ title() }}</h2>
    <p>{{ description() }}</p>
    <ng-content />
  </div>`,
})
export class EmptyState {
  title = input('Nothing here yet');
  description = input('A little space for your next step.');
}
@Component({
  selector: 'app-status',
  template: `<span class="status">{{ value().replaceAll('_', ' ') }}</span>`,
})
export class StatusLabel {
  value = input('');
}
@Component({
  selector: 'app-row',
  template: `<div class="row">
    <div class="row-content"><ng-content /></div>
    <span aria-hidden="true" class="chevron">↗</span>
  </div>`,
})
export class ListRow {}
@Component({
  selector: 'app-field',
  template: `<div class="field">
    <label [for]="forId()">{{ label() }}{{ required() ? ' *' : '' }}</label
    ><ng-content />
  </div>`,
})
export class FormField {
  forId = input('');
  label = input('');
  required = input(false);
}
@Component({
  selector: 'app-confirm',
  template: `<dialog #dialog class="dialog bottom-sheet" (cancel)="cancelled.emit()">
    <h2>{{ title() }}</h2>
    <p>{{ description() }}</p>
    <div class="actions">
      <button autofocus (click)="cancelled.emit()">Cancel</button
      ><button class="primary" (click)="confirmed.emit()">{{ action() }}</button>
    </div>
  </dialog>`,
})
export class ConfirmationDialog {
  title = input('Confirm action');
  description = input('');
  action = input('Confirm');
  confirmed = output<void>();
  cancelled = output<void>();
  dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  constructor() {
    afterNextRender(() => this.dialog()?.nativeElement.showModal());
  }
}
@Component({ selector: 'app-loading', template: `<p role="status" class="hint">{{ text() }}</p>` })
export class LoadingState {
  text = input('Loading…');
}
@Component({
  selector: 'app-error',
  template: `<div class="notice" role="alert">
    <p>{{ message() }}</p>
    <button (click)="retry.emit()">Try again</button>
  </div>`,
})
export class ErrorState {
  message = input('Unable to load records.');
  retry = output<void>();
}
