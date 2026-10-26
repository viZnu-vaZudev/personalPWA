import { calendarDate, DEMO_USER, EntityKind, RecordData } from './models';
export function demoFixtures(): Partial<Record<EntityKind, RecordData[]>> {
  const day = calendarDate();
  const now = new Date().toISOString();
  const row = (title: string, extra: Partial<RecordData> = {}): RecordData => ({
    id: crypto.randomUUID(),
    user_id: DEMO_USER,
    created_at: now,
    updated_at: now,
    title,
    ...extra,
  });
  const project = row('MyCompass PWA', {
    status: 'active',
    description: 'A quieter place to make progress on what matters.',
    weekly_availability: '8',
    target_date: day,
    frontend: 'Angular',
    backend: 'Supabase',
  });
  const account = row('Everyday account', { amount: '42500' });
  const category = row('Food & groceries');
  const goal = row('Grow into a senior frontend role', {
    type: 'career',
    target_role: 'Senior frontend engineer',
    description: 'Build with intention. Learn by doing.',
    target_date: day,
  });
  return {
    projects: [
      project,
      row('Personal knowledge base', {
        status: 'drafted',
        description: 'Make room for ideas worth keeping.',
      }),
      row('Freelance portfolio', { status: 'not_started' }),
    ],
    tasks: [
      row('Finish the project wireframes', {
        status: 'todo',
        date: day,
        priority: 'high',
        project_id: project.id,
        duration: '60',
        remaining_effort: '120',
      }),
      row('Review October spending', {
        status: 'todo',
        date: day,
        priority: 'high',
        duration: '20',
      }),
      row('Practice one system design question', {
        status: 'todo',
        date: day,
        priority: 'medium',
        goal_id: goal.id,
        duration: '30',
      }),
    ],
    reminders: [
      row('Monthly planning check-in', { date: day, reminder_at: new Date().toISOString() }),
    ],
    accounts: [account],
    categories: [category],
    transactions: [
      row('Monthly salary', { amount: '85000', type: 'income', date: day, account_id: account.id }),
      row('Groceries', {
        amount: '1840.50',
        type: 'expense',
        date: day,
        account_id: account.id,
        category_id: category.id,
      }),
      row('Coffee with a friend', {
        amount: '280',
        type: 'expense',
        date: day,
        account_id: account.id,
        category_id: category.id,
      }),
    ],
    budgets: [row('Monthly spending', { amount: '30000', date: day.slice(0, 7) + '-01' })],
    goals: [
      goal,
      row('A small independent studio', {
        type: 'business',
        stage: 'validate',
        description: 'Help small teams turn a useful idea into a thoughtful product.',
      }),
    ],
    milestones: [
      row('First usable release', {
        project_id: project.id,
        date: day,
        status: 'not_started',
        position: '1',
      }),
    ],
    profiles: [{ ...row('Alex'), id: DEMO_USER, timezone: 'Asia/Kolkata', currency: 'INR' }],
  };
}
