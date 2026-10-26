import { Injectable } from '@angular/core';
import { EntityKind, RecordData } from './models';
import { ConflictError, Repository } from './repository';
export interface Pending {
  id: string;
  user_id: string;
  kind: EntityKind;
  row: RecordData;
  baseVersion?: string;
  state: 'pending' | 'synced' | 'failed' | 'conflict';
  error?: string;
}
export function canRetry(item: Pending, userId: string) {
  return item.user_id === userId && (item.state === 'pending' || item.state === 'failed');
}
@Injectable({ providedIn: 'root' })
export class OfflineQueue {
  private db(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('mycompass-outbox', 2);
      request.onupgradeneeded = () => {
        for (const name of ['pending', 'snapshots'])
          if (!request.result.objectStoreNames.contains(name))
            request.result.createObjectStore(name, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  private async operation<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
    name = 'pending',
  ): Promise<T> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(name, mode);
      const req = operation(tx.objectStore(name));
      tx.oncomplete = () => {
        db.close();
        resolve(req.result);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  }
  async cache(kind: EntityKind, userId: string, rows: RecordData[]) {
    // Explicit, account-scoped offline editing/lookup data. Never cache health collections.
    if (!['tasks', 'transactions', 'accounts', 'categories'].includes(kind)) return;
    await this.operation(
      'readwrite',
      (s) => s.put({ id: userId + ':' + kind, rows: rows.filter((r) => r.user_id === userId) }),
      'snapshots',
    );
  }
  async cached(kind: EntityKind, userId: string): Promise<RecordData[]> {
    const value = await this.operation('readonly', (s) => s.get(userId + ':' + kind), 'snapshots');
    return value?.rows || [];
  }
  async put(item: Pending) {
    const existing = (await this.list(item.user_id)).find((p) => p.id === item.id);
    if (item.state === 'pending' && existing && existing.state !== 'synced')
      item.baseVersion = existing.baseVersion;
    await this.operation('readwrite', (s) => s.put(item));
  }
  async list(userId: string) {
    return ((await this.operation('readonly', (s) => s.getAll())) as Pending[]).filter(
      (x) => x.user_id === userId,
    );
  }
  private syncing = false;
  async sync(userId: string, repo: Repository, stillCurrent: () => boolean) {
    if (this.syncing) return;
    this.syncing = true;
    try {
      for (const item of await this.list(userId)) {
        if (!stillCurrent()) break;
        if (!canRetry(item, userId)) continue;
        try {
          const saved = await repo.save(item.kind, item.row, item.baseVersion);
          const cached = await this.cached(item.kind, userId);
          await this.cache(item.kind, userId, [...cached.filter((r) => r.id !== saved.id), saved]);
          item.state = 'synced';
          item.error = undefined;
        } catch (error) {
          item.state = error instanceof ConflictError ? 'conflict' : 'failed';
          item.error = error instanceof Error ? error.message : 'Request failed';
        }
        await this.put(item);
      }
    } finally {
      this.syncing = false;
    }
  }
}
