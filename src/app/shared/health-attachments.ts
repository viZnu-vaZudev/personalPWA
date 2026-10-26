import { Component, inject, input, effect, signal } from '@angular/core';
import type { Database } from '../core/generated/database.types';
import { Attachments } from '../core/attachments';
import { Auth } from '../core/auth';
@Component({
  selector: 'app-health-attachments',
  standalone: true,
  template: `<section>
    <h2>Private reports</h2>
    @if (auth.mode() === 'demo') {
      <p>Private uploads require a live account.</p>
    } @else {
      <label for="health-report">Upload report (20 MiB maximum)</label>
      <input id="health-report" type="file" [disabled]="busy()" (change)="upload($event)" />
      <p>Reports stay private. Preview links expire after one minute.</p>
      @for (file of files(); track file.id) {
        <div class="detail-line">
          <span>{{ file.original_name }}</span
          ><button type="button" [disabled]="busy()" (click)="preview(file.id)">Preview</button>
        </div>
      } @empty {
        <p>No reports attached.</p>
      }
      @if (url()) {
        <a [href]="url()" target="_blank" rel="noopener noreferrer">Open private report ↗</a>
      }
      @if (error()) {
        <p role="alert">{{ error() }}</p>
        <button type="button" (click)="load()">Retry loading reports</button>
      }
    }
  </section>`,
})
export class HealthAttachments {
  readonly healthRecordId = input.required<string>();
  readonly auth = inject(Auth);
  private api = inject(Attachments);
  readonly files = signal<Database['public']['Tables']['attachments']['Row'][]>([]);
  readonly error = signal('');
  readonly busy = signal(false);
  readonly url = signal('');
  constructor() {
    effect(() => {
      this.healthRecordId();
      if (this.auth.mode() === 'live') void this.load();
    });
  }
  async load() {
    try {
      this.error.set('');
      this.files.set(await this.api.list(this.healthRecordId()));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Unable to load reports.');
    }
  }
  async upload(event: Event) {
    const input = event.target as HTMLInputElement,
      file = input.files?.[0];
    if (!file) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.api.upload(this.healthRecordId(), file);
      await this.load();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      input.value = '';
      this.busy.set(false);
    }
  }
  async preview(id: string) {
    this.busy.set(true);
    this.error.set('');
    try {
      this.url.set(await this.api.preview(id));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Preview failed.');
    } finally {
      this.busy.set(false);
    }
  }
}
