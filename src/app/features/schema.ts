import { EntityKind } from '../core/models';
export interface Field {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  required?: boolean;
}
export interface Feature {
  kind: EntityKind;
  title: string;
  singular: string;
  description: string;
  fields: Field[];
}
const text = (key: string, label: string, required = false): Field => ({ key, label, required });
const date = (key = 'date', label = 'Date', required = false): Field => ({
  key,
  label,
  type: 'date',
  required,
});
const instant = (key: string, label: string, required = false): Field => ({
  key,
  label,
  type: 'datetime-local',
  required,
});
const select = (key: string, label: string, options: string[], required = false): Field => ({
  key,
  label,
  options,
  required,
});
const cash = (key: string, label: string, required = true): Field => ({
  key,
  label,
  type: 'money',
  required,
});
const number = (key: string, label: string, required = false): Field => ({
  key,
  label,
  type: 'number',
  required,
});
const link = (key: string, label: string, required = false): Field => text(key, label, required);
const url = (key = 'url', label = 'URL', required = false): Field => ({
  key,
  label,
  type: 'url',
  required,
});
const feature = (
  kind: EntityKind,
  title: string,
  singular: string,
  fields: Field[],
  description = 'Your private records.',
): Feature => ({ kind, title, singular, fields, description });
const tasks = [
  text('title', 'Task name', true),
  select('status', 'Status', ['todo', 'in_progress', 'blocked', 'done', 'cancelled'], true),
  select('priority', 'Priority', ['high', 'medium', 'low', 'lowest'], true),
  date('date', 'Scheduled day'),
  instant('due_at', 'Due time'),
  number('duration', 'Estimated minutes'),
  number('remaining_effort', 'Remaining minutes'),
  link('project_id', 'Project'),
  link('goal_id', 'Goal'),
  link('milestone_id', 'Project milestone'),
  text('description', 'Notes'),
];
const learning = [
  link('career_skill_id', 'Skill', true),
  number('duration', 'Minutes spent', true),
  date('date', 'Completed on', true),
  link('task_id', 'Related task'),
  url('url', 'Evidence URL'),
  text('description', 'Notes'),
];
export const features: Record<string, Feature> = {
  tasks: feature(
    'tasks',
    'Tasks',
    'task',
    tasks,
    'Make the next step a small one. Add dependencies and reminders using their linked records.',
  ),
  projects: feature(
    'projects',
    'Projects',
    'project',
    [text('title', 'Project name', true), text('description', 'Description')],
    'One step at a time.',
  ),
  transactions: feature(
    'transactions',
    'Transactions',
    'transaction',
    [
      text('title', 'Description', true),
      select('type', 'Type', ['expense', 'income', 'transfer'], true),
      cash('amount', 'Amount (INR)'),
      link('account_id', 'Account', true),
      link('destination_account_id', 'Destination account'),
      link('category_id', 'Category'),
      date('date', 'Occurred on', true),
      link('project_id', 'Project'),
      link('business_id', 'Business'),
    ],
    'Record each actual payment once.',
  ),
  goals: feature(
    'goals',
    'Goals',
    'goal',
    [
      text('title', 'Goal name', true),
      select('type', 'Type', ['career', 'business', 'personal'], true),
      select(
        'status',
        'Status',
        ['not_started', 'active', 'completed', 'paused', 'abandoned'],
        true,
      ),
      text('description', 'Purpose'),
      date('target_date', 'Target date'),
    ],
    'A direction worth moving in.',
  ),
  accounts: feature(
    'accounts',
    'Accounts',
    'account',
    [
      text('title', 'Account name', true),
      select('type', 'Type', ['bank', 'cash', 'wallet', 'credit'], true),
      cash('amount', 'Opening balance (INR; signed)'),
      date('date', 'Opening date', true),
    ],
    'Opening balance immediately before the opening date. All recorded transactions affect the ledger balance.',
  ),
  categories: feature(
    'categories',
    'Categories',
    'category',
    [
      text('title', 'Category name', true),
      select('type', 'Direction', ['expense', 'income'], true),
    ],
    'Category direction cannot change after creation.',
  ),
  budgets: feature(
    'budgets',
    'Budgets',
    'budget',
    [
      link('category_id', 'Expense category', true),
      cash('amount', 'Limit (INR)'),
      date('date', 'Period starts', true),
      date('period_end', 'Period ends (inclusive)', true),
    ],
    'Each budget measures its category independently. Overlapping budgets are not additive.',
  ),
  savings: feature(
    'savings',
    'Savings goals',
    'savings goal',
    [
      text('title', 'Goal name', true),
      cash('amount', 'Target (INR)'),
      date('target_date', 'Target date'),
    ],
    'Allocations are separate from spending.',
  ),
  contributions: feature(
    'contributions',
    'Contributions',
    'contribution',
    [
      link('savings_goal_id', 'Savings goal', true),
      cash('amount', 'Allocation (INR)'),
      date('date', 'Contributed on', true),
      link('transaction_id', 'Supporting transaction'),
    ],
    'Allocations do not create additional expenses.',
  ),
  bills: feature(
    'bills',
    'Recurring payments',
    'recurring payment',
    [
      text('title', 'Name', true),
      cash('amount', 'Amount (INR)'),
      select('type', 'Direction', ['expense', 'income'], true),
      select('frequency', 'Frequency', ['monthly', 'weekly', 'daily', 'quarterly', 'yearly'], true),
      date('date', 'Next due date', true),
      link('account_id', 'Account'),
      link('category_id', 'Category'),
      link('loan_id', 'Loan'),
      select('active', 'Active', ['true', 'false'], true),
    ],
    'Forecast only. Schedules never generate actual transactions automatically.',
  ),
  loans: feature(
    'loans',
    'Loans',
    'loan',
    [
      text('title', 'Loan name', true),
      cash('amount', 'Original principal (INR)'),
      cash('outstanding_principal', 'Outstanding principal snapshot (INR)'),
      date('date', 'Snapshot as of (end of day)', true),
      number('annual_interest_rate', 'Annual interest rate (%)'),
      cash('emi_amount', 'EMI (INR)'),
      number('due_day', 'Payment day (1–31)', true),
    ],
    'Reconcile this snapshot manually. Repayment history does not automatically change it.',
  ),
  repayments: feature(
    'repayments',
    'Repayment history',
    'repayment',
    [
      link('loan_id', 'Loan', true),
      link('transaction_id', 'Existing expense transaction', true),
      cash('principal_amount', 'Principal (INR)'),
      cash('interest_amount', 'Interest (INR)'),
      cash('fee_amount', 'Fees (INR)'),
    ],
    'Principal + interest + fees must equal the linked expense exactly. One breakdown per transaction.',
  ),
  milestones: feature(
    'milestones',
    'Milestones',
    'milestone',
    [
      text('title', 'Milestone', true),
      link('project_id', 'Project (choose project or goal)'),
      link('goal_id', 'Goal (choose project or goal)'),
      date('start_date', 'Project milestone starts'),
      date('date', 'Due date'),
      number('position', 'Project sort order'),
      instant('completed_at', 'Goal milestone completed at'),
    ],
    'Choose one parent. Project and goal milestones are separate records.',
  ),
  repositories: feature(
    'repositories',
    'Repositories',
    'repository',
    [
      text('title', 'Repository name', true),
      link('project_id', 'Project', true),
      url('url', 'Repository URL', true),
    ],
    'Named HTTPS links. Never include access tokens.',
  ),
  hosting: feature(
    'hosting',
    'Hosting',
    'hosting entry',
    [
      text('title', 'Service name', true),
      link('project_id', 'Project', true),
      text('provider', 'Provider', true),
      select('environment', 'Environment', ['development', 'staging', 'production'], true),
      url(),
      text('description', 'Notes'),
    ],
    'Store public details only. URLs are unverified.',
  ),
  technologies: feature('technologies', 'Technologies', 'technology', [
    text('title', 'Technology', true),
    link('project_id', 'Project', true),
    select(
      'category',
      'Category',
      ['frontend', 'backend', 'database', 'infrastructure', 'tooling', 'other'],
      true,
    ),
    text('version', 'Version'),
  ]),
  dependencies: feature(
    'dependencies',
    'Task dependencies',
    'dependency',
    [link('task_id', 'Task', true), link('depends_on_task_id', 'Depends on task', true)],
    'Self-dependencies and cycles are rejected by the database.',
  ),
  goal_projects: feature('goal_projects', 'Linked projects', 'project link', [
    link('goal_id', 'Goal', true),
    link('project_id', 'Project', true),
  ]),
  project_updates: feature('project_updates', 'Project updates', 'project update', [
    link('project_id', 'Project', true),
    text('description', 'Update note', true),
    select('old_status', 'Previous status', ['drafted', 'not_started', 'active', 'completed']),
    select('new_status', 'New status', ['drafted', 'not_started', 'active', 'completed']),
  ]),
  career_plans: feature('career_plans', 'Career plans', 'career plan', [
    text('title', 'Target role', true),
    link('goal_id', 'Career goal', true),
    date('target_date', 'Target date'),
    text('description', 'Notes'),
  ]),
  skills: feature('skills', 'Skills', 'skill', [
    text('title', 'Skill', true),
    link('career_plan_id', 'Career plan', true),
    number('current_level', 'Current level (0–5)', true),
    number('target_level', 'Target level (0–5)', true),
  ]),
  learning: feature('learning', 'Learning log', 'learning entry', learning),
  evidence: feature(
    'evidence',
    'Practical evidence',
    'evidence log',
    learning.map((f) => (f.key === 'url' ? { ...f, required: true } : f)),
    'Learning logs with evidence URLs. The same record also appears in Learning log.',
  ),
  interviews: feature(
    'interviews',
    'Interview preparation',
    'preparation task',
    tasks,
    'These are ordinary goal-linked tasks, shared with Today.',
  ),
  applications: feature('applications', 'Job applications', 'application', [
    text('title', 'Company', true),
    text('role', 'Role', true),
    select(
      'status',
      'Stage',
      ['planned', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn'],
      true,
    ),
    date('date', 'Applied on'),
    instant('reminder_at', 'Next follow-up'),
    url('url', 'Application URL'),
  ]),
  businesses: feature('businesses', 'Businesses', 'business', [
    text('title', 'Business name', true),
    text('description', 'Customer problem'),
    select(
      'stage',
      'Stage',
      ['idea', 'validate', 'build', 'find_customers', 'earn', 'improve'],
      true,
    ),
    text('notes', 'Notes'),
  ]),
  ideas: feature(
    'ideas',
    'Idea backlog',
    'business idea',
    [text('title', 'Idea', true), text('description', 'Customer problem'), text('notes', 'Notes')],
    'Ideas are businesses at the idea stage. Promote them from Businesses.',
  ),
  prospects: feature('prospects', 'Customer prospects', 'prospect', [
    text('title', 'Contact name', true),
    link('business_id', 'Business', true),
    text('description', 'Contact details'),
    select('status', 'Status', ['new', 'contacted', 'interested', 'customer', 'closed'], true),
    instant('reminder_at', 'Next follow-up'),
  ]),
  appointments: feature('appointments', 'Appointments', 'appointment', [
    text('title', 'Provider', true),
    text('specialty', 'Specialty'),
    instant('reminder_at', 'Appointment time', true),
    text('reason', 'Reason'),
    select('status', 'Status', ['scheduled', 'completed', 'cancelled'], true),
    text('description', 'Private notes'),
  ]),
  health_notes: feature(
    'health_notes',
    'Health records',
    'health record',
    [
      text('title', 'Record title', true),
      text('record_type', 'Record type', true),
      date('date', 'Recorded on', true),
      link('appointment_id', 'Appointment'),
      text('description', 'Private notes'),
    ],
    'Add private reports from the saved record.',
  ),
  medications: feature(
    'medications',
    'Medications',
    'medication',
    [
      text('title', 'Medication', true),
      text('description', 'Clinician instructions'),
      date('start_date', 'Start date', true),
      date('end_date', 'End date'),
      select('active', 'Active', ['true', 'false'], true),
    ],
    'For reminders, create a linked reminder record.',
  ),
  attendance: feature('attendance', 'Gym sessions', 'session', [
    date('date', 'Session date', true),
    instant('started_at', 'Started at'),
    instant('finished_at', 'Finished at'),
    select('energy', 'Energy rating', ['1', '2', '3', '4', '5']),
    select('difficulty', 'Difficulty rating', ['1', '2', '3', '4', '5']),
    text('description', 'Session notes'),
  ]),
  workouts: feature('workouts', 'Workout sets', 'workout set', [
    link('gym_session_id', 'Gym session', true),
    link('exercise_id', 'Exercise', true),
    number('set_number', 'Set number', true),
    number('repetitions', 'Repetitions', true),
    number('weight_kg', 'Weight (kg)'),
  ]),
  exercises: feature('exercises', 'Exercises', 'exercise', [
    text('title', 'Exercise name', true),
    text('muscle_group', 'Muscle group', true),
  ]),
  reviews: feature('reviews', 'Weekly reflections', 'reflection', [
    date('date', 'Week beginning (Monday)', true),
    text('description', 'Reflection'),
    text('next_priorities', 'Next week focus'),
  ]),
  profiles: feature('profiles', 'Profile', 'profile', [
    text('title', 'Display name', true),
    text('timezone', 'IANA timezone', true),
    select('currency', 'Currency', ['INR'], true),
    number('weekly_availability', 'Weekly project hours', true),
  ]),
  reminders: feature(
    'reminders',
    'Reminders',
    'reminder',
    [
      text('title', 'Reminder', true),
      instant('reminder_at', 'Scheduled time', true),
      select('status', 'Status', ['pending', 'sent', 'dismissed'], true),
      link('task_id', 'Task (one optional parent)'),
      link('appointment_id', 'Appointment'),
      link('medication_id', 'Medication'),
      link('recurring_payment_id', 'Recurring payment'),
    ],
    'Pending reminders appear in the app. No background delivery worker is configured.',
  ),
};
export const projectFields: Field[] = [
  text('title', 'Project name', true),
  text('description', 'Description'),
  select('status', 'Status', ['drafted', 'not_started', 'active', 'completed'], true),
  date('start_date', 'Start date'),
  date('target_date', 'Target date'),
  number('weekly_availability', 'Weekly availability (hours)'),
  link('business_id', 'Business'),
];
