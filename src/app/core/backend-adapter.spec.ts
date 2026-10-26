import { TestBed } from '@angular/core/testing';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './generated/database.types';
import {
  deserialize,
  goalMilestones,
  serialize,
  toInstant,
  localDateTime,
} from './backend-adapter';
import { SupabaseRepository, SUPABASE_CLIENT } from './live-repository';
import { ConflictError } from './repository';
import { EntityKind, RecordData } from './models';
import { Attachments } from './attachments';
const uid = '11111111-1111-4111-8111-111111111111';
const id = '22222222-2222-4222-8222-222222222222';
const version = '2026-10-26T03:04:05.123456+00:00';
const profile = {
  id: uid,
  display_name: 'Owner',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  weekly_project_hours: 10,
  created_at: version,
  updated_at: version,
};
const row = (extra: Partial<RecordData> = {}): RecordData => ({
  id,
  user_id: uid,
  created_at: version,
  updated_at: version,
  title: 'Test',
  ...extra,
});
describe('Database contract adapter', () => {
  it('serializes only real task columns and retains full server versions', () => {
    const result = serialize(
      'tasks',
      row({
        date: '2026-10-26',
        priority: 'high',
        duration: '30',
        remaining_effort: '15',
        project_id: '',
        dependencies: 'not a column',
        reminder_at: 'not a column',
      }),
    );
    expect(result).toEqual({
      id,
      user_id: uid,
      title: 'Test',
      status: 'todo',
      priority: 1,
      scheduled_at: '2026-10-25T18:30:00.000Z',
      estimated_minutes: 30,
      remaining_minutes: 15,
      project_id: null,
    });
    expect(
      deserialize('tasks', { ...result, created_at: version, updated_at: version }).updated_at,
    ).toBe(version);
  });
  it('retains an existing scheduled instant on unrelated task edits', () => {
    const task = deserialize('tasks', {
      id,
      user_id: uid,
      title: 'Task',
      scheduled_at: '2026-10-26T10:12:13.123456+00:00',
      priority: 4,
      created_at: version,
      updated_at: version,
    });
    expect(task.priority).toBe('lowest');
    expect(serialize('tasks', task)['scheduled_at']).toBe('2026-10-26T10:12:13.123456+00:00');
  });
  it('sends exact decimal strings, transfer destinations, and matching category shapes', () => {
    const result = serialize(
      'transactions',
      row({
        type: 'transfer',
        amount: '999999999999.99',
        date: '2026-10-26',
        account_id: uid,
        destination_account_id: id,
        category_id: uid,
        goal_id: 'not a business',
      }),
    );
    expect(result['amount']).toBe('999999999999.99');
    expect(result['to_account_id']).toBe(id);
    expect(result['category_id']).toBeNull();
    expect(result['goal_id']).toBeUndefined();
    expect(() =>
      serialize(
        'transactions',
        row({ type: 'expense', amount: '1000000000000.00', date: '2026-10-26', account_id: uid }),
      ),
    ).toThrow('supported INR range');
  });
  it('uses actual account, loan and repayment contracts', () => {
    expect(
      serialize('accounts', row({ type: 'bank', amount: '-12.34', date: '2026-10-01' }))[
        'opening_balance'
      ],
    ).toBe('-12.34');
    expect(() => serialize('loans', row({ amount: '100' }))).toThrow('outstanding principal');
    const repayment = serialize(
      'repayments',
      row({
        loan_id: uid,
        transaction_id: id,
        principal_amount: '80',
        interest_amount: '20',
        fee_amount: '0',
      }),
    );
    expect(repayment['amount']).toBeUndefined();
    expect(repayment['principal_amount']).toBe('80');
  });
  it('keeps profiles free of a nonexistent user_id and maps explicit archive timestamps', () => {
    const p = serialize(
      'profiles',
      row({ id: uid, timezone: 'Asia/Kolkata', currency: 'INR', weekly_availability: '10' }),
    );
    expect(p['user_id']).toBeUndefined();
    expect(p['display_name']).toBe('Test');
    expect(
      serialize('projects', row({ archived: true, archived_at: version }))['archived_at'],
    ).toBe(version);
  });
  it('separates project and goal milestones and rejects ambiguous parent selection', () => {
    expect(
      serialize('milestones', row({ goal_id: uid, date: '2026-10-26' }), undefined, goalMilestones)[
        'goal_id'
      ],
    ).toBe(uid);
    expect(() => serialize('milestones', row({ project_id: uid, goal_id: id }))).toThrow(
      'either a project or a goal',
    );
  });
  it('interprets wall times in the profile timezone and rejects nonexistent DST times', () => {
    expect(toInstant('2026-10-26T09:30', 'Asia/Kolkata')).toBe('2026-10-26T04:00:00.000Z');
    expect(localDateTime('2026-10-26T04:00:00Z', 'Asia/Kolkata')).toBe('2026-10-26T09:30:00');
    expect(() => toInstant('2026-03-08T02:30', 'America/New_York')).toThrow('does not exist');
  });
});

describe('Supabase transport integration', () => {
  let requests: { url: URL; method: string; body: any }[];
  let respond: (url: URL, method: string, body: any) => Response;
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
  let client: ReturnType<typeof createClient<Database>>;
  let repo: SupabaseRepository;
  beforeEach(() => {
    requests = [];
    respond = (url, method, body) =>
      json(
        method === 'GET' ? [] : { ...body, created_at: version, updated_at: version },
        method === 'POST' ? 201 : 200,
      );
    client = createClient<Database>('https://mycompass-test.supabase.co', 'sb_publishable_test', {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (input, init) => {
          const url = new URL(String(input)),
            method = init?.method || 'GET',
            body = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
          requests.push({ url, method, body });
          if (url.pathname === '/rest/v1/profiles') return json(profile);
          return respond(url, method, body);
        },
      },
    });
    TestBed.configureTestingModule({ providers: [{ provide: SUPABASE_CLIENT, useValue: client }] });
    repo = TestBed.inject(SupabaseRepository);
  });
  it('sends normalized inserts using the real SDK and returns server timestamps', async () => {
    const saved = await repo.save('projects', row());
    const request = requests.find((r) => r.method === 'POST')!;
    expect(request.url.pathname).toBe('/rest/v1/projects');
    expect(request.body.name).toBe('Test');
    expect(request.body.title).toBeUndefined();
    expect(request.body.created_at).toBeUndefined();
    expect(saved.updated_at).toBe(version);
  });
  it('uses atomic owner and microsecond version predicates and stops stale updates', async () => {
    respond = () => json(null);
    await expect(repo.save('tasks', row(), version)).rejects.toBeInstanceOf(ConflictError);
    const request = requests.find((r) => r.method === 'PATCH')!;
    expect(request.url.searchParams.get('updated_at')).toBe('eq.' + version);
    expect(request.url.searchParams.get('user_id')).toBe('eq.' + uid);
  });
  it('paginates beyond the API row limit with deterministic ordering and owner predicates', async () => {
    respond = (url) =>
      json(
        Array.from({ length: url.searchParams.get('offset') === '0' ? 500 : 1 }, (_, i) => ({
          id: `${url.searchParams.get('offset')}-${i}`,
          user_id: uid,
          title: 'Task',
          created_at: version,
          updated_at: version,
        })),
      );
    expect(await repo.list('tasks', uid)).toHaveLength(501);
    const pages = requests.filter((r) => r.url.pathname === '/rest/v1/tasks');
    expect(pages).toHaveLength(2);
    expect(pages[1].url.searchParams.get('offset')).toBe('500');
    expect(pages[0].url.searchParams.get('user_id')).toBe('eq.' + uid);
    expect(pages[0].url.searchParams.get('order')).toBe('id.asc');
  });
  it('treats a repeated identical decimal insert as success and a different insert as conflict', async () => {
    respond = (_url, method, body) =>
      method === 'POST'
        ? json({ code: '23505', message: 'duplicate' }, 409)
        : json([
            {
              id,
              user_id: uid,
              note: 'Test',
              type: 'expense',
              amount: 0.1,
              account_id: uid,
              to_account_id: null,
              category_id: null,
              occurred_on: '2026-10-26',
              created_at: version,
              updated_at: version,
            },
          ]);
    const input = row({ type: 'expense', amount: '0.10', account_id: uid, date: '2026-10-26' });
    expect((await repo.save('transactions', input)).amount).toBe('0.10');
    await expect(repo.save('transactions', { ...input, amount: '0.20' })).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
  it('reads goal milestones from their own table and rejects changing parent table on edit', async () => {
    respond = (url) =>
      json(
        url.pathname.endsWith('/goal_milestones')
          ? [
              {
                id,
                user_id: uid,
                title: 'Goal step',
                goal_id: uid,
                created_at: version,
                updated_at: version,
              },
            ]
          : [],
      );
    const milestones = await repo.list('milestones', uid);
    expect(milestones).toHaveLength(1);
    await expect(
      repo.save('milestones', { ...milestones[0], goal_id: '', project_id: uid }, version),
    ).rejects.toThrow('new milestone');
  });
  it('cleans up an uploaded object if attachment metadata is rejected', async () => {
    vi.spyOn(client.auth, 'getUser').mockResolvedValue({
      data: { user: { id: uid } },
      error: null,
    } as any);
    respond = (url, method) =>
      url.pathname === '/rest/v1/attachments'
        ? json({ code: '23503', message: 'invalid parent' }, 409)
        : json(method === 'DELETE' ? [] : { Key: 'uploaded' });
    const api = TestBed.inject(Attachments);
    await expect(
      api.upload(id, new File(['report'], 'report.txt', { type: 'text/plain' })),
    ).rejects.toThrow('linked record');
    const deletion = requests.find((r) => r.method === 'DELETE')!;
    expect(deletion.url.pathname).toBe('/storage/v1/object/mycompass-private');
    expect(deletion.body.prefixes[0]).toMatch(new RegExp('^' + uid + '/'));
  });
});
