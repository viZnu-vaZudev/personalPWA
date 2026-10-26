import { Injectable } from '@angular/core';
import { EntityKind, RecordData } from './models';
export interface Repository {
  list(kind: EntityKind, userId: string): Promise<RecordData[]>;
  save(kind: EntityKind, row: RecordData, baseVersion?: string): Promise<RecordData>;
}
export class ConflictError extends Error {
  constructor() {
    super('This record changed elsewhere. Review the latest version before saving again.');
  }
}
@Injectable({ providedIn: 'root' })
export class DemoRepository implements Repository {
  private data: Partial<Record<EntityKind, RecordData[]>> = {};
  async initialize() {
    const saved = localStorage.getItem('mycompass.demo.v1');
    if (saved) this.data = JSON.parse(saved);
    else {
      this.data = (await import('./demo-fixtures')).demoFixtures();
      this.persist();
    }
  }
  private persist() {
    localStorage.setItem('mycompass.demo.v1', JSON.stringify(this.data));
  }
  async list(kind: EntityKind, userId: string) {
    return structuredClone((this.data[kind] || []).filter((r) => r.user_id === userId));
  }
  async save(kind: EntityKind, row: RecordData, baseVersion?: string) {
    const rows = this.data[kind] || [];
    const current = rows.find((r) => r.id === row.id);
    if (current && baseVersion && current.updated_at !== baseVersion) throw new ConflictError();
    const saved = { ...row, updated_at: new Date().toISOString() };
    this.data[kind] = [...rows.filter((r) => r.id !== row.id), saved];
    this.persist();
    return structuredClone(saved);
  }
}
export { SupabaseRepository } from './live-repository';
