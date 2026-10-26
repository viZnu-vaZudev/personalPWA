import { Injectable, InjectionToken, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './generated/database.types';
import { config } from './config';
import { EntityKind, RecordData } from './models';
import {
  BackendTable,
  deserialize,
  goalMilestones,
  Mapping,
  mappings,
  serialize,
} from './backend-adapter';
import { ConflictError, Repository } from './repository';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient<Database> | null>(
  'MyCompass Supabase client',
  {
    providedIn: 'root',
    factory: () => {
      if (!config.supabaseUrl || !config.supabasePublishableKey) return null;
      if (!/^https?:\/\//.test(config.supabaseUrl))
        throw new Error('Configure a valid Supabase project URL.');
      const key = config.supabasePublishableKey;
      if (key.startsWith('sb_secret_'))
        throw new Error('A server secret cannot be used in MyCompass.');
      if (!key.startsWith('sb_publishable_')) {
        let role = '';
        try {
          role = JSON.parse(atob(key.split('.')[1].replaceAll('-', '+').replaceAll('_', '/'))).role;
        } catch {
          /* rejected below */
        }
        if (role !== 'anon') throw new Error('Use a Supabase publishable key or legacy anon key.');
      }
      return createClient<Database>(config.supabaseUrl, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
    },
  },
);
export function backendError(error: { message: string; code?: string }): Error {
  if (error.code === '23503' || error.code === '23001')
    return new Error(
      'A linked record is missing, belongs to another account, or is still in use. Refresh your choices and try again.',
    );
  if (error.code === '23514')
    return new Error(
      'The database rejected these values. Check dates, amounts, task dependencies, and repayment totals.',
    );
  if (error.code === '42501')
    return new Error('Your session cannot access this record. Sign in again and retry.');
  return new Error(error.message);
}
type RawRow = Record<string, unknown>;
function samePayload(payload: RawRow, existing: RawRow) {
  return Object.entries(payload).every(([key, value]) => {
    const actual = existing[key];
    if (value === null) return actual == null;
    if (typeof actual === 'number' && value !== '' && Number.isFinite(Number(value)))
      return actual === Number(value);
    if (typeof value === 'string' && /_at$/.test(key) && typeof actual === 'string')
      return Date.parse(value) === Date.parse(actual);
    return actual === value;
  });
}
@Injectable({ providedIn: 'root' })
export class SupabaseRepository implements Repository {
  readonly client = inject(SUPABASE_CLIENT);
  readonly confirmedTables = Object.fromEntries(
    Object.entries(mappings).map(([kind, m]) => [kind, m.table]),
  );
  private profileCache = new Map<
    string,
    Promise<Database['public']['Tables']['profiles']['Row']>
  >();
  private connection() {
    if (!this.client) throw new Error('Supabase is not configured.');
    return this.client;
  }
  // Generated types validate all mapping columns. The metadata-driven transport
  // accepts decimal strings for numeric columns, as supported by PostgREST.
  private relation(table: BackendTable) {
    return (this.connection() as SupabaseClient).from(table);
  }
  clearProfileCache() {
    this.profileCache.clear();
  }
  private profile(userId: string) {
    let pending = this.profileCache.get(userId);
    if (!pending) {
      pending = (async () => {
        const { data, error } = await this.connection()
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw backendError(error);
        return data;
      })();
      this.profileCache.set(userId, pending);
      pending.catch(() => this.profileCache.delete(userId));
    }
    return pending;
  }
  private async rawRows(table: BackendTable, userId: string): Promise<RawRow[]> {
    const all: RawRow[] = [];
    const size = 500;
    for (let start = 0; ; start += size) {
      const { data, error } = await this.relation(table)
        .select('*')
        .eq(table === 'profiles' ? 'id' : 'user_id', userId)
        .order('id')
        .range(start, start + size - 1);
      if (error) throw backendError(error);
      all.push(...(data as unknown as RawRow[]));
      if (data.length < size) return all;
    }
  }
  async list(kind: EntityKind, userId: string): Promise<RecordData[]> {
    if (!userId) throw new Error('Sign in before loading records.');
    if (kind === 'profiles') this.profileCache.delete(userId);
    const profile = await this.profile(userId),
      timezone = profile.timezone;
    if (kind === 'profiles') return [deserialize(kind, profile, timezone)];
    const m = mappings[kind];
    let rows = await this.rawRows(m.table, userId);
    if (kind === 'ideas') rows = rows.filter((r) => r['stage'] === 'idea');
    if (kind === 'evidence') rows = rows.filter((r) => !!r['evidence_url']);
    const decoded = rows.map((r) => deserialize(kind, r, timezone));
    if (kind === 'milestones')
      decoded.push(
        ...(await this.rawRows('goal_milestones', userId)).map((r) =>
          deserialize(kind, r, timezone, goalMilestones),
        ),
      );
    return decoded;
  }
  async save(kind: EntityKind, row: RecordData, baseVersion?: string): Promise<RecordData> {
    const profile = await this.profile(row.user_id);
    const m: Mapping =
      kind === 'milestones' && row.goal_id && !row.project_id ? goalMilestones : mappings[kind];
    if (baseVersion && row['backend_table'] && row['backend_table'] !== m.table)
      throw new Error('Create a new milestone to move between a project and a goal.');
    const payload = serialize(kind, row, profile.timezone, m),
      client = this.connection();
    if (kind === 'profiles' && !baseVersion) {
      if (profile.display_name) throw new ConflictError();
      baseVersion = profile.updated_at;
    }
    const ownerColumn = kind === 'profiles' ? 'id' : 'user_id';
    const result = baseVersion
      ? await this.relation(m.table)
          .update(payload)
          .eq('id', row.id)
          .eq(ownerColumn, row.user_id)
          .eq('updated_at', baseVersion)
          .select()
          .maybeSingle()
      : await this.relation(m.table).insert(payload).select().single();
    if (result.error?.code === '23505' && !baseVersion) {
      const existing = await this.relation(m.table)
        .select('*')
        .eq('id', row.id)
        .eq(ownerColumn, row.user_id)
        .maybeSingle();
      if (existing.error) throw backendError(existing.error);
      if (!existing.data || !samePayload(payload, existing.data as unknown as RawRow))
        throw new ConflictError();
      return deserialize(kind, existing.data as unknown as RawRow, profile.timezone, m);
    }
    if (result.error) throw backendError(result.error);
    if (!result.data) throw new ConflictError();
    this.profileCache.delete(row.user_id);
    return deserialize(
      kind,
      result.data as unknown as RawRow,
      kind === 'profiles' ? String(payload['timezone']) : profile.timezone,
      m,
    );
  }
}
