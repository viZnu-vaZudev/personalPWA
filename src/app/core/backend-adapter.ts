import type { Database } from './generated/database.types';
import { calendarDate, EntityKind, minorUnits, RecordData } from './models';

export type BackendTable = keyof Database['public']['Tables'];
type Column<T extends BackendTable> = keyof Database['public']['Tables'][T]['Row'] & string;
export interface Mapping {
  table: BackendTable;
  fields: Readonly<Record<string, string>>;
  required: readonly string[];
  defaults?: Readonly<Record<string, string | number | boolean | undefined>>;
}
function mapping<T extends BackendTable>(
  table: T,
  fields: Record<string, Column<T>>,
  required: Column<T>[] = [],
  defaults?: Partial<Record<Column<T>, string | number | boolean>>,
): Mapping {
  return { table, fields, required, defaults };
}
const taskFields = {
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  date: 'scheduled_at',
  due_at: 'due_at',
  duration: 'estimated_minutes',
  remaining_effort: 'remaining_minutes',
  project_id: 'project_id',
  milestone_id: 'milestone_id',
  goal_id: 'goal_id',
} as const;
const learningFields = {
  description: 'notes',
  date: 'completed_on',
  career_skill_id: 'career_skill_id',
  task_id: 'task_id',
  duration: 'minutes_spent',
  url: 'evidence_url',
} as const;
export const mappings = {
  tasks: mapping('tasks', taskFields, ['title'], { status: 'todo', priority: 2 }),
  interviews: mapping('tasks', taskFields, ['title'], { status: 'todo', priority: 2 }),
  projects: mapping(
    'projects',
    {
      title: 'name',
      description: 'description',
      status: 'status',
      business_id: 'business_id',
      start_date: 'start_date',
      target_date: 'target_date',
      weekly_availability: 'weekly_available_hours',
      archived: 'archived_at',
    },
    ['name'],
    { status: 'drafted' },
  ),
  transactions: mapping(
    'transactions',
    {
      title: 'note',
      type: 'type',
      amount: 'amount',
      account_id: 'account_id',
      destination_account_id: 'to_account_id',
      category_id: 'category_id',
      date: 'occurred_on',
      project_id: 'project_id',
      business_id: 'business_id',
    },
    ['type', 'amount', 'account_id', 'occurred_on'],
  ),
  goals: mapping(
    'goals',
    {
      title: 'title',
      description: 'description',
      type: 'type',
      status: 'status',
      target_date: 'target_date',
    },
    ['title', 'type'],
    { status: 'not_started' },
  ),
  accounts: mapping(
    'accounts',
    {
      title: 'name',
      type: 'type',
      currency: 'currency',
      amount: 'opening_balance',
      date: 'opening_date',
      archived: 'archived_at',
    },
    ['name', 'type', 'opening_date'],
    { currency: 'INR', opening_balance: '0.00' },
  ),
  categories: mapping('transaction_categories', { title: 'name', type: 'type' }, ['name', 'type']),
  budgets: mapping(
    'budgets',
    {
      amount: 'amount',
      category_id: 'category_id',
      date: 'period_start',
      period_end: 'period_end',
    },
    ['category_id', 'amount', 'period_start', 'period_end'],
  ),
  savings: mapping(
    'savings_goals',
    { title: 'name', amount: 'target_amount', target_date: 'target_date' },
    ['name', 'target_amount'],
  ),
  contributions: mapping(
    'savings_contributions',
    {
      savings_goal_id: 'savings_goal_id',
      transaction_id: 'transaction_id',
      amount: 'amount',
      date: 'contributed_on',
    },
    ['savings_goal_id', 'amount', 'contributed_on'],
  ),
  bills: mapping(
    'recurring_payments',
    {
      title: 'name',
      amount: 'amount',
      type: 'direction',
      frequency: 'frequency',
      date: 'next_due_date',
      account_id: 'account_id',
      category_id: 'category_id',
      loan_id: 'loan_id',
      active: 'active',
    },
    ['name', 'amount', 'direction', 'frequency', 'next_due_date'],
    { active: true },
  ),
  loans: mapping(
    'loans',
    {
      title: 'name',
      amount: 'original_principal',
      outstanding_principal: 'outstanding_principal',
      date: 'balance_as_of',
      annual_interest_rate: 'annual_interest_rate',
      emi_amount: 'emi_amount',
      due_day: 'due_day',
      archived: 'archived_at',
    },
    [
      'name',
      'original_principal',
      'outstanding_principal',
      'balance_as_of',
      'emi_amount',
      'due_day',
    ],
  ),
  repayments: mapping(
    'loan_payments',
    {
      loan_id: 'loan_id',
      transaction_id: 'transaction_id',
      principal_amount: 'principal_amount',
      interest_amount: 'interest_amount',
      fee_amount: 'fee_amount',
    },
    ['loan_id', 'transaction_id', 'principal_amount'],
    { interest_amount: '0.00', fee_amount: '0.00' },
  ),
  milestones: mapping(
    'project_milestones',
    {
      title: 'title',
      project_id: 'project_id',
      start_date: 'start_date',
      date: 'due_date',
      position: 'sort_order',
    },
    ['title', 'project_id'],
    { sort_order: 0 },
  ),
  repositories: mapping(
    'project_repositories',
    { title: 'name', project_id: 'project_id', url: 'url' },
    ['name', 'project_id', 'url'],
  ),
  hosting: mapping(
    'project_hostings',
    {
      title: 'service_name',
      project_id: 'project_id',
      provider: 'provider',
      environment: 'environment',
      url: 'url',
      description: 'notes',
    },
    ['service_name', 'project_id', 'provider', 'environment'],
  ),
  technologies: mapping(
    'project_technologies',
    { title: 'name', project_id: 'project_id', category: 'category', version: 'version' },
    ['name', 'project_id', 'category'],
  ),
  dependencies: mapping(
    'task_dependencies',
    { task_id: 'task_id', depends_on_task_id: 'depends_on_task_id' },
    ['task_id', 'depends_on_task_id'],
  ),
  goal_projects: mapping('goal_projects', { goal_id: 'goal_id', project_id: 'project_id' }, [
    'goal_id',
    'project_id',
  ]),
  project_updates: mapping(
    'project_updates',
    {
      project_id: 'project_id',
      description: 'note',
      old_status: 'old_status',
      new_status: 'new_status',
    },
    ['project_id', 'note'],
  ),
  career_plans: mapping(
    'career_plans',
    { goal_id: 'goal_id', title: 'target_role', target_date: 'target_date', description: 'notes' },
    ['goal_id', 'target_role'],
  ),
  skills: mapping(
    'career_skills',
    {
      title: 'name',
      career_plan_id: 'career_plan_id',
      current_level: 'current_level',
      target_level: 'target_level',
    },
    ['name', 'career_plan_id', 'target_level'],
    { current_level: 0 },
  ),
  learning: mapping('learning_logs', learningFields, [
    'career_skill_id',
    'minutes_spent',
    'completed_on',
  ]),
  evidence: mapping('learning_logs', learningFields, [
    'career_skill_id',
    'minutes_spent',
    'completed_on',
    'evidence_url',
  ]),
  applications: mapping(
    'job_applications',
    {
      title: 'company',
      role: 'role',
      url: 'url',
      status: 'status',
      date: 'applied_on',
      reminder_at: 'next_follow_up_at',
    },
    ['company', 'role'],
    { status: 'planned' },
  ),
  businesses: mapping(
    'businesses',
    { title: 'name', description: 'customer_problem', stage: 'stage', notes: 'notes' },
    ['name'],
    { stage: 'idea' },
  ),
  ideas: mapping(
    'businesses',
    { title: 'name', description: 'customer_problem', notes: 'notes' },
    ['name'],
    { stage: 'idea' },
  ),
  prospects: mapping(
    'business_contacts',
    {
      title: 'name',
      business_id: 'business_id',
      description: 'contact_details',
      status: 'status',
      reminder_at: 'next_follow_up_at',
    },
    ['name', 'business_id'],
    { status: 'new' },
  ),
  appointments: mapping(
    'health_appointments',
    {
      title: 'provider',
      specialty: 'specialty',
      reminder_at: 'scheduled_at',
      reason: 'reason',
      description: 'notes',
      status: 'status',
    },
    ['provider', 'scheduled_at'],
    { status: 'scheduled' },
  ),
  health_notes: mapping(
    'health_records',
    {
      title: 'title',
      appointment_id: 'appointment_id',
      record_type: 'record_type',
      date: 'recorded_on',
      description: 'notes',
    },
    ['title', 'record_type', 'recorded_on'],
  ),
  medications: mapping(
    'medications',
    {
      title: 'name',
      description: 'instructions',
      start_date: 'start_date',
      end_date: 'end_date',
      active: 'active',
    },
    ['name', 'start_date'],
    { active: true },
  ),
  attendance: mapping(
    'gym_sessions',
    {
      date: 'session_date',
      energy: 'energy_rating',
      difficulty: 'difficulty_rating',
      description: 'notes',
      started_at: 'started_at',
      finished_at: 'finished_at',
    },
    ['session_date'],
  ),
  workouts: mapping(
    'workout_sets',
    {
      gym_session_id: 'gym_session_id',
      exercise_id: 'exercise_id',
      set_number: 'set_number',
      repetitions: 'repetitions',
      weight_kg: 'weight_kg',
    },
    ['gym_session_id', 'exercise_id', 'set_number', 'repetitions'],
  ),
  exercises: mapping('exercises', { title: 'name', muscle_group: 'muscle_group' }, [
    'name',
    'muscle_group',
  ]),
  reviews: mapping(
    'weekly_reviews',
    { date: 'week_start', description: 'reflection', next_priorities: 'next_week_focus' },
    ['week_start'],
  ),
  profiles: mapping(
    'profiles',
    {
      title: 'display_name',
      timezone: 'timezone',
      currency: 'currency',
      weekly_availability: 'weekly_project_hours',
    },
    ['display_name', 'timezone', 'currency'],
  ),
  reminders: mapping(
    'reminders',
    {
      title: 'title',
      reminder_at: 'scheduled_at',
      status: 'status',
      task_id: 'task_id',
      appointment_id: 'appointment_id',
      medication_id: 'medication_id',
      recurring_payment_id: 'recurring_payment_id',
    },
    ['title', 'scheduled_at'],
    { status: 'pending' },
  ),
} satisfies Record<EntityKind, Mapping>;

export const goalMilestones = mapping(
  'goal_milestones',
  { title: 'title', goal_id: 'goal_id', date: 'due_date', completed_at: 'completed_at' },
  ['title', 'goal_id'],
);
const moneyColumns = new Set([
  'amount',
  'opening_balance',
  'original_principal',
  'outstanding_principal',
  'emi_amount',
  'principal_amount',
  'interest_amount',
  'fee_amount',
  'target_amount',
]);
const integerColumns = new Set([
  'estimated_minutes',
  'remaining_minutes',
  'priority',
  'sort_order',
  'current_level',
  'target_level',
  'minutes_spent',
  'due_day',
  'energy_rating',
  'difficulty_rating',
  'set_number',
  'repetitions',
]);
const decimalColumns = new Set([
  'weekly_available_hours',
  'weekly_project_hours',
  'annual_interest_rate',
  'weight_kg',
]);
const instantColumns = new Set([
  'scheduled_at',
  'due_at',
  'completed_at',
  'next_follow_up_at',
  'started_at',
  'finished_at',
]);

export function localDateTime(instant: string, timezone: string): string {
  if (!instant) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return `${p['year']}-${p['month']}-${p['day']}T${p['hour']}:${p['minute']}:${p['second']}`;
}
// Interpret a wall-clock form value in the profile timezone, never the browser timezone.
export function toInstant(value: string, timezone: string): string {
  if (/[zZ]$|[+-]\d\d:\d\d$/.test(value)) {
    if (!Number.isFinite(Date.parse(value))) throw new Error('Enter a valid date and time.');
    return value;
  }
  const local =
    value.length === 10 ? value + 'T00:00:00' : value.length === 16 ? value + ':00' : value;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(local))
    throw new Error('Enter a valid date and time.');
  const target = Date.parse(local + 'Z');
  let estimate = target;
  for (let i = 0; i < 5; i++) {
    const shown = Date.parse(localDateTime(new Date(estimate).toISOString(), timezone) + 'Z');
    const delta = target - shown;
    if (delta === 0) return new Date(estimate).toISOString();
    estimate += delta;
  }
  throw new Error('This local time does not exist in your timezone. Choose another time.');
}

export function serialize(
  kind: EntityKind,
  row: RecordData,
  timezone = 'Asia/Kolkata',
  selected?: Mapping,
): Record<string, unknown> {
  const m =
    selected ||
    (kind === 'milestones' && row.goal_id && !row.project_id ? goalMilestones : mappings[kind]);
  const result: Record<string, unknown> = { ...m.defaults, id: row.id };
  if (kind !== 'profiles') result['user_id'] = row.user_id;
  for (const [field, column] of Object.entries(m.fields)) {
    const value = row[field];
    if (value === undefined) continue;
    if (column === 'archived_at') {
      result[column] = value ? row['archived_at'] || new Date().toISOString() : null;
      continue;
    }
    if (value === '') {
      result[column] = m.required.includes(column) ? '' : null;
      continue;
    }
    if (moneyColumns.has(column)) {
      const minor = minorUnits(String(value));
      if (minor > 99999999999999n || minor < -99999999999999n)
        throw new Error('Amount exceeds the supported INR range.');
      result[column] = String(value);
    } else if (column === 'priority') {
      result[column] =
        ({ high: 1, medium: 2, low: 3, lowest: 4 } as Record<string, number>)[String(value)] ??
        Number(value);
    } else if (integerColumns.has(column)) {
      const n = Number(value);
      if (!Number.isSafeInteger(n)) throw new Error(field + ' must be a whole number.');
      result[column] = n;
    } else if (decimalColumns.has(column)) {
      const n = Number(value);
      if (!Number.isFinite(n)) throw new Error(field + ' must be a number.');
      result[column] = String(value);
    } else if (instantColumns.has(column)) {
      // A day-only planner edit must retain an unchanged existing scheduled time.
      result[column] =
        kind === 'tasks' &&
        field === 'date' &&
        row['scheduled_at'] &&
        calendarDate(new Date(String(row['scheduled_at'])), timezone) === value
          ? row['scheduled_at']
          : toInstant(String(value), timezone);
    } else if (column === 'active') result[column] = value === true || value === 'true';
    else result[column] = value;
  }
  if (kind === 'transactions') {
    if (row.type === 'transfer') result['category_id'] = null;
    else result['to_account_id'] = null;
  }
  for (const column of m.required)
    if (result[column] === undefined || result[column] === null || result[column] === '')
      throw new Error('Complete the required ' + column.replaceAll('_', ' ') + ' field.');
  if (kind === 'milestones' && !!row.project_id === !!row.goal_id)
    throw new Error('Choose either a project or a goal for this milestone.');
  return result;
}

export function deserialize(
  kind: EntityKind,
  raw: Record<string, unknown>,
  timezone = 'Asia/Kolkata',
  selected?: Mapping,
): RecordData {
  const m = selected || mappings[kind];
  const row: RecordData = {
    id: String(raw['id']),
    user_id: String(raw['user_id'] || raw['id']),
    created_at: String(raw['created_at']),
    updated_at: String(raw['updated_at']),
    title: '',
  };
  for (const [k, v] of Object.entries(raw))
    if (v !== null && v !== undefined) row[k] = typeof v === 'boolean' ? v : String(v);
  for (const [field, column] of Object.entries(m.fields)) {
    const value = raw[column];
    if (column === 'archived_at') row[field] = !!value;
    else if (value === null || value === undefined) row[field] = '';
    else if (moneyColumns.has(column))
      row[field] = typeof value === 'number' ? value.toFixed(2) : String(value);
    else if (column === 'priority')
      row[field] = ({ 1: 'high', 2: 'medium', 3: 'low', 4: 'lowest' } as Record<string, string>)[
        String(value)
      ];
    else if (field === 'date' && instantColumns.has(column))
      row[field] = calendarDate(new Date(String(value)), timezone);
    else row[field] = typeof value === 'boolean' ? value : String(value);
  }
  row['backend_table'] = m.table;
  if (kind === 'repayments') {
    const total = ['principal_amount', 'interest_amount', 'fee_amount'].reduce(
      (n, key) => n + minorUnits(String(row[key] || '0')),
      0n,
    );
    row.amount = `${total / 100n}.${(total % 100n).toString().padStart(2, '0')}`;
  }
  if (!row.title)
    row.title =
      kind === 'profiles'
        ? 'Your profile'
        : kind === 'budgets'
          ? 'Category budget'
          : kind === 'reviews'
            ? 'Week of ' + row.date
            : kind === 'attendance'
              ? 'Gym session · ' + row.date
              : kind === 'learning' || kind === 'evidence'
                ? String(row.description || 'Learning log')
                : kind === 'workouts'
                  ? 'Set ' + row['set_number']
                  : kind === 'repayments'
                    ? 'Loan repayment'
                    : kind === 'contributions'
                      ? 'Savings contribution'
                      : kind === 'dependencies'
                        ? 'Task dependency'
                        : kind === 'goal_projects'
                          ? 'Linked project'
                          : 'Record';
  if (kind === 'appointments' && raw['scheduled_at'])
    row.date = calendarDate(new Date(String(raw['scheduled_at'])), timezone);
  if (kind === 'applications' || kind === 'prospects')
    row['follow_up_date'] = raw['next_follow_up_at']
      ? calendarDate(new Date(String(raw['next_follow_up_at'])), timezone)
      : '';
  return row;
}
