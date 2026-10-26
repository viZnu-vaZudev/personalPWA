import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Auth } from './auth';
import { DemoRepository, SupabaseRepository } from './repository';
import { EntityKind, RecordData } from './models';
import { OfflineQueue, Pending } from './offline';
@Injectable({ providedIn: 'root' })
export class Store {
  readonly auth = inject(Auth);
  private demo = inject(DemoRepository);
  private live = inject(SupabaseRepository);
  readonly queue = inject(OfflineQueue);
  readonly data = signal<Partial<Record<EntityKind, RecordData[]>>>({});
  readonly pending = signal<Pending[]>([]);
  readonly error = signal('');
  readonly loading = signal(false);
  readonly message = signal('');
  readonly timezone = signal('Asia/Kolkata');
  readonly isDemo = computed(() => this.auth.mode() === 'demo');
  constructor() {
    effect(() => {
      this.auth.userId();
      this.auth.mode();
      this.clear();
    });
  }
  get repo() {
    return this.isDemo() ? this.demo : this.live;
  }
  rows(kind: EntityKind) {
    return this.data()[kind] || [];
  }
  async load(...kinds: EntityKind[]) {
    this.loading.set(true);
    this.error.set('');
    await this.auth.ready;
    const user = this.auth.userId();
    if (!user) {
      this.loading.set(false);
      return;
    }
    const mode = this.auth.mode();
    try {
      if (navigator.onLine || this.isDemo()) {
        const profiles = await this.repo.list('profiles', user);
        if (user !== this.auth.userId() || mode !== this.auth.mode()) return;
        this.timezone.set(profiles[0]?.timezone || 'Asia/Kolkata');
      }
      this.pending.set(await this.queue.list(user));
      const entries = await Promise.all(
        kinds.map(async (kind) => {
          const rows =
            !navigator.onLine && !this.isDemo()
              ? await this.queue.cached(kind, user)
              : await this.repo.list(kind, user);
          if (!this.isDemo() && navigator.onLine) await this.queue.cache(kind, user, rows);
          return [kind, rows] as const;
        }),
      );
      if (user !== this.auth.userId() || mode !== this.auth.mode()) return;
      const merged = { ...this.data() };
      for (const [kind, rows] of entries) {
        const pending = this.pending().filter((p) => p.kind === kind && p.state !== 'synced');
        merged[kind] = [
          ...rows.filter((r) => !pending.some((p) => p.row.id === r.id)),
          ...pending.map((p) => p.row),
        ];
      }
      this.data.set(merged);
    } catch (e) {
      if (user === this.auth.userId() && mode === this.auth.mode())
        this.error.set(e instanceof Error ? e.message : 'Unable to load records.');
    } finally {
      this.loading.set(false);
    }
  }
  syncState(id: string) {
    return (
      this.pending().find((p) => p.id === id)?.state || (this.isDemo() ? 'demo · local' : 'synced')
    );
  }
  async save(kind: EntityKind, input: Partial<RecordData>, existing?: RecordData) {
    const now = new Date().toISOString();
    const row: RecordData = {
      ...existing,
      ...input,
      id: existing?.id || (kind === 'profiles' ? this.auth.userId() : crypto.randomUUID()),
      user_id: this.auth.userId(),
      created_at: existing?.created_at || now,
      updated_at: now,
      title: input.title?.trim() || existing?.title || '',
    };
    if (kind === 'tasks' && input.status === 'done' && existing?.status !== 'done')
      row['completed_at'] = now;
    if (kind === 'tasks' && input.status && input.status !== 'done') row['completed_at'] = '';
    let saved = row;
    if (!navigator.onLine && this.auth.mode() === 'live') {
      if (!['tasks', 'transactions'].includes(kind))
        throw new Error('This form requires a connection.');
      await this.queue.put({
        id: row.id,
        user_id: row.user_id,
        kind,
        row,
        baseVersion: existing?.updated_at,
        state: 'pending',
      });
      this.pending.set(await this.queue.list(row.user_id));
      this.message.set('Saved on this device · pending sync');
    } else {
      saved = await this.repo.save(kind, row, existing?.updated_at);
      if (!this.isDemo()) {
        const cached = await this.queue.cached(kind, row.user_id);
        await this.queue.cache(kind, row.user_id, [
          ...cached.filter((r) => r.id !== saved.id),
          saved,
        ]);
      }
      this.message.set(this.isDemo() ? 'Saved in fictional demo' : 'Saved');
    }
    if (row.user_id !== this.auth.userId()) return saved;
    this.data.update((data) => ({
      ...data,
      [kind]: [...(data[kind] || []).filter((r) => r.id !== saved.id), saved],
    }));
    return saved;
  }
  async retry() {
    const user = this.auth.userId();
    if (this.isDemo()) return;
    await this.queue.sync(
      user,
      this.repo,
      () => this.auth.userId() === user && this.auth.mode() === 'live',
    );
    this.pending.set(await this.queue.list(user));
  }
  clear() {
    this.live.clearProfileCache();
    this.timezone.set('Asia/Kolkata');
    this.data.set({});
    this.pending.set([]);
    this.message.set('');
  }
}
