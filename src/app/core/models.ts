export type EntityKind =
  | 'tasks'
  | 'projects'
  | 'transactions'
  | 'goals'
  | 'reminders'
  | 'accounts'
  | 'categories'
  | 'budgets'
  | 'savings'
  | 'contributions'
  | 'bills'
  | 'loans'
  | 'repayments'
  | 'milestones'
  | 'repositories'
  | 'hosting'
  | 'skills'
  | 'learning'
  | 'evidence'
  | 'interviews'
  | 'applications'
  | 'prospects'
  | 'ideas'
  | 'appointments'
  | 'health_notes'
  | 'medications'
  | 'attendance'
  | 'workouts'
  | 'reviews'
  | 'profiles'
  | 'technologies'
  | 'dependencies'
  | 'goal_projects'
  | 'project_updates'
  | 'career_plans'
  | 'businesses'
  | 'exercises';
export interface RecordData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
  status?: string;
  date?: string;
  target_date?: string;
  project_id?: string;
  goal_id?: string;
  milestone_id?: string;
  priority?: string;
  duration?: string;
  remaining_effort?: string;
  dependencies?: string;
  blockers?: string;
  amount?: string;
  type?: string;
  account_id?: string;
  destination_account_id?: string;
  category_id?: string;
  weekly_availability?: string;
  start_date?: string;
  url?: string;
  provider?: string;
  environment?: string;
  frontend?: string;
  backend?: string;
  database?: string;
  other?: string;
  stage?: string;
  target_role?: string;
  timezone?: string;
  currency?: string;
  energy?: string;
  difficulty?: string;
  exercises?: string;
  next_priorities?: string;
  reminder_at?: string;
  archived?: boolean;
  notifications?: boolean;
  [key: string]: string | boolean | undefined;
}
export const DEMO_USER = '00000000-0000-4000-8000-000000000001';
export function calendarDate(date = new Date(), timezone = 'Asia/Kolkata'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function minorUnits(value: string): bigint {
  if (!/^-?\d+(\.\d{1,2})?$/.test(value))
    throw new Error('Enter an amount with at most two decimal places.');
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = value.replace('-', '').split('.');
  return (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))) * (negative ? -1n : 1n);
}
export function money(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const positive = value < 0n ? -value : value;
  return (
    sign +
    '₹' +
    new Intl.NumberFormat('en-IN').format(positive / 100n) +
    '.' +
    (positive % 100n).toString().padStart(2, '0')
  );
}
export function totals(rows: RecordData[]) {
  return rows.reduce(
    (a, r) => {
      if (r.type === 'income') a.income += minorUnits(r.amount || '0');
      if (r.type === 'expense') a.expense += minorUnits(r.amount || '0');
      return a;
    },
    { income: 0n, expense: 0n },
  );
}
