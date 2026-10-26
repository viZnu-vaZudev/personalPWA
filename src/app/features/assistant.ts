import { Component, Injectable, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '../core/store';
import { PageHeader } from '../shared/ui';
export interface AssistantProvider {
  ask(prompt: string): Promise<string>;
}
@Injectable({ providedIn: 'root' })
export class UnavailableProvider implements AssistantProvider {
  async ask(_prompt: string): Promise<string> {
    throw new Error('No AI provider is configured. Your message has not been sent.');
  }
}
@Component({
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeader],
  template: `<a class="back" routerLink="/today">← Today</a
    ><app-header title="A little perspective" subtitle="Ask assistant" />
    <p class="notice">AI is unavailable. No provider is configured.</p>
    <div class="suggestions">
      @for (prompt of prompts; track prompt) {
        <button (click)="input.setValue(prompt)">{{ prompt }} ↗</button>
      }
    </div>
    <label for="prompt">Your question</label
    ><textarea id="prompt" [formControl]="input" rows="4"></textarea
    ><button (click)="ask()">Ask assistant</button>
    @if (message()) {
      <p role="status">{{ message() }}</p>
    }
    @if (store.isDemo()) {
      <section>
        <p class="eyebrow">FICTIONAL DEMO · NOT AI ANALYSIS</p>
        <h2>Preview a proposed action</h2>
        <p>This manually authored example shows how confirmation would work.</p>
        <label for="proposal">Proposed task</label
        ><input id="proposal" [formControl]="proposal" /><button
          class="primary"
          [disabled]="proposal.invalid"
          (click)="confirm()"
        >
          Confirm & save demo task
        </button>
      </section>
    }`,
})
export class AssistantPage {
  readonly store = inject(Store);
  private provider = inject(UnavailableProvider);
  readonly input = new FormControl('', { nonNullable: true });
  readonly proposal = new FormControl('Plan three priorities for tomorrow', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/)],
  });
  readonly message = signal('');
  readonly prompts = [
    'Help me plan today',
    'Review my spending',
    'What is my next step?',
    'Help me reflect on this week',
  ];
  async ask() {
    try {
      this.message.set(await this.provider.ask(this.input.value));
    } catch (e) {
      this.message.set(e instanceof Error ? e.message : 'Unavailable');
    }
  }
  async confirm() {
    if (this.proposal.invalid) return;
    try {
      await this.store.save('tasks', {
        title: this.proposal.value,
        status: 'todo',
        priority: 'medium',
      });
      this.message.set('Confirmed demo task saved.');
    } catch (e) {
      this.message.set(String(e));
    }
  }
}
