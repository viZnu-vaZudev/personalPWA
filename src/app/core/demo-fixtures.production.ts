import { EntityKind, RecordData } from './models';
export function demoFixtures(): Partial<Record<EntityKind, RecordData[]>> {
  throw new Error('Fictional fixtures are excluded from production.');
}
