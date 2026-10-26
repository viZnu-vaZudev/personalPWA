import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { signal } from '@angular/core';
import { IDBFactory } from 'fake-indexeddb';
import { Auth } from './core/auth';
import { Store } from './core/store';
import { calendarDate, DEMO_USER, minorUnits, money, RecordData, totals } from './core/models';
import { ConflictError, DemoRepository, Repository } from './core/repository';
import { canRetry, OfflineQueue, Pending } from './core/offline';
import { routes } from './app.routes';
import { RecordsPage } from './features/records';

const row = (title: string, extra: Partial<RecordData> = {}): RecordData => ({
  id: crypto.randomUUID(),
  user_id: DEMO_USER,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
  title,
  ...extra,
});
describe('Finance presentation', () => {
  it('adds decimal amounts exactly and excludes transfers', () => {
    const result = totals([
      row('a', { type: 'expense', amount: '0.10' }),
      row('b', { type: 'expense', amount: '0.20' }),
      row('move', { type: 'transfer', amount: '1000' }),
      row('salary', { type: 'income', amount: '100' }),
    ]);
    expect(result.expense).toBe(30n);
    expect(result.income).toBe(10000n);
    expect(money(result.expense)).toBe('₹0.30');
  });
  it('preserves amounts above the safe floating point integer range', () =>
    expect(minorUnits('9007199254740993.01')).toBe(900719925474099301n));
  it('rejects fractional paise and invalid input', () => {
    expect(() => minorUnits('1.001')).toThrow();
    expect(() => minorUnits('NaN')).toThrow();
  });
  it('uses Kolkata calendar dates across UTC midnight', () =>
    expect(calendarDate(new Date('2026-10-25T20:00:00Z'))).toBe('2026-10-26'));
});
describe('Demo persistence', () => {
  beforeEach(() => localStorage.clear());
  it('retains task identity when scheduled for Today', async () => {
    const repo = new DemoRepository();
    await repo.initialize();
    const task = (await repo.list('tasks', DEMO_USER))[0];
    await repo.save('tasks', { ...task, date: '2026-10-26' }, task.updated_at);
    const rows = await repo.list('tasks', DEMO_USER);
    expect(rows.filter((r) => r.id === task.id)).toHaveLength(1);
    expect(rows.find((r) => r.id === task.id)?.date).toBe('2026-10-26');
  });
  it('stops stale writes and isolates owners', async () => {
    const repo = new DemoRepository();
    await repo.initialize();
    const task = (await repo.list('tasks', DEMO_USER))[0];
    await expect(repo.save('tasks', task, 'old-version')).rejects.toBeInstanceOf(ConflictError);
    expect(await repo.list('tasks', 'someone-else')).toEqual([]);
  });
});
describe('Offline outbox', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'indexedDB', { value: new IDBFactory(), configurable: true });
  });
  it('preserves the original server version across repeated offline edits', async () => {
    const queue = new OfflineQueue();
    const task = row('First edit');
    await queue.put({
      id: task.id,
      user_id: DEMO_USER,
      kind: 'tasks',
      row: task,
      baseVersion: 'server-version',
      state: 'pending',
    });
    await queue.put({
      id: task.id,
      user_id: DEMO_USER,
      kind: 'tasks',
      row: { ...task, title: 'Second edit' },
      baseVersion: 'local-version',
      state: 'pending',
    });
    const pending = await queue.list(DEMO_USER);
    expect(pending).toHaveLength(1);
    expect(pending[0].baseVersion).toBe('server-version');
    expect(pending[0].row.title).toBe('Second edit');
  });
  it('scopes offline lookups to owners and never snapshots health records', async () => {
    const queue = new OfflineQueue();
    await queue.cache('accounts', DEMO_USER, [
      row('My account'),
      row('Other account', { user_id: 'other' }),
    ]);
    expect(await queue.cached('accounts', DEMO_USER)).toHaveLength(1);
    expect(await queue.cached('accounts', 'other')).toEqual([]);
    await queue.cache('health_notes', DEMO_USER, [row('Private note')]);
    expect(await queue.cached('health_notes', DEMO_USER)).toEqual([]);
  });
  it('retries a failed record with the same UUID and never sends another account’s work', async () => {
    const queue = new OfflineQueue();
    const task = row('Offline task');
    const item: Pending = {
      id: task.id,
      user_id: DEMO_USER,
      kind: 'tasks',
      row: task,
      state: 'pending',
    };
    await queue.put(item);
    const other = row('Other account', { user_id: 'other' });
    await queue.put({
      id: other.id,
      user_id: 'other',
      kind: 'tasks',
      row: other,
      state: 'pending',
    });
    let attempts = 0;
    const ids: string[] = [];
    const repo: Repository = {
      list: async () => [],
      save: async (_kind, r) => {
        ids.push(r.id);
        if (++attempts === 1) throw new Error('Disconnected');
        return r;
      },
    };
    await queue.sync(DEMO_USER, repo, () => true);
    expect((await queue.list(DEMO_USER))[0].state).toBe('failed');
    await queue.sync(DEMO_USER, repo, () => true);
    expect((await queue.list(DEMO_USER))[0].state).toBe('synced');
    expect(ids).toEqual([task.id, task.id]);
    expect((await queue.list('other'))[0].state).toBe('pending');
  });
  it('does not retry conflicts or continue after an account switch', async () => {
    const queue = new OfflineQueue();
    const task = row('Conflict');
    await queue.put({
      id: task.id,
      user_id: DEMO_USER,
      kind: 'tasks',
      row: task,
      state: 'pending',
    });
    const save = vi.fn().mockRejectedValue(new ConflictError());
    const repo = { list: async () => [], save };
    await queue.sync(DEMO_USER, repo, () => false);
    expect(save).not.toHaveBeenCalled();
    await queue.sync(DEMO_USER, repo, () => true);
    await queue.sync(DEMO_USER, repo, () => true);
    expect(save).toHaveBeenCalledTimes(1);
    expect((await queue.list(DEMO_USER))[0].state).toBe('conflict');
    expect(
      canRetry(
        { id: 'x', user_id: 'other', kind: 'tasks', row: task, state: 'pending' },
        DEMO_USER,
      ),
    ).toBe(false);
  });
});
describe('Routes and reactive forms', () => {
  let mockStore: any;
  beforeEach(() => {
    mockStore = {
      data: signal({}),
      pending: signal([]),
      loading: signal(false),
      error: signal(''),
      message: signal(''),
      isDemo: () => true,
      timezone: signal('Asia/Kolkata'),
      rows: () => [],
      load: async () => {},
      save: vi.fn().mockResolvedValue(row('saved')),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        {
          provide: Auth,
          useValue: {
            mode: signal('demo'),
            userId: signal(DEMO_USER),
            ready: Promise.resolve(),
            demoAllowed: true,
            configured: false,
          },
        },
        { provide: Store, useValue: mockStore },
      ],
    });
  });
  it('rejects blank project names and malformed money', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/projects/new', RecordsPage);
    page.form.controls['title'].setValue('   ');
    expect(page.form.invalid).toBe(true);
    await page.save();
    expect(mockStore.save).not.toHaveBeenCalled();
    const transaction = await harness.navigateByUrl('/money/transactions/new', RecordsPage);
    transaction.form.patchValue({ title: 'Lunch', amount: '12.345', account_id: 'account' });
    expect(transaction.form.invalid).toBe(true);
  });
  it('requires a distinct transfer destination', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/money/transactions/new', RecordsPage);
    page.form.patchValue({
      title: 'Transfer',
      type: 'transfer',
      amount: '100',
      account_id: 'a',
      destination_account_id: 'a',
    });
    await page.save();
    expect(page.error()).toContain('different destination');
    expect(mockStore.save).not.toHaveBeenCalled();
  });
  it('creates projects as drafted', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/projects/new', RecordsPage);
    page.form.controls['title'].setValue('A new project');
    await page.save();
    expect(mockStore.save).toHaveBeenCalledWith(
      'projects',
      expect.objectContaining({ status: 'drafted', title: 'A new project' }),
      undefined,
    );
  });
  it('protects private routes when signed out', async () => {
    TestBed.inject(Auth).mode.set('none');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/projects');
    expect(TestBed.inject(Router).url).toBe('/auth');
  });
  it('orders supporting project routes ahead of project IDs', () => {
    expect(routes.findIndex((r) => r.path === 'projects/tasks')).toBeLessThan(
      routes.findIndex((r) => r.path === 'projects/:id'),
    );
    expect(routes.filter((r) => r.path?.endsWith('/new')).length).toBeGreaterThan(20);
  });
});
