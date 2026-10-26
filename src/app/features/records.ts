import { localDateTime, toInstant } from '../core/backend-adapter';
import { HealthAttachments } from '../shared/health-attachments';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '../core/store';
import { calendarDate, EntityKind, minorUnits, money, RecordData } from '../core/models';
import {
  ConfirmationDialog,
  EmptyState,
  ErrorState,
  FormField,
  ListRow,
  LoadingState,
  PageHeader,
  StatusLabel,
} from '../shared/ui';
import { features, Field, projectFields } from './schema';
@Component({
  standalone: true,
  imports: [
    RouterLink,
    HealthAttachments,
    ReactiveFormsModule,
    PageHeader,
    EmptyState,
    ListRow,
    StatusLabel,
    ConfirmationDialog,
    FormField,
    LoadingState,
    ErrorState,
  ],
  template: `
    <a class="back" [routerLink]="back()">← {{ parentLabel() }}</a>
    <app-header [title]="heading()" [subtitle]="feature.description">
      @if (!editing() && !item()) {
        <a class="primary" [routerLink]="[base, 'new']" [queryParams]="scope"
          >+ Add {{ feature.singular }}</a
        >
      }
    </app-header>
    @if (store.loading()) {
      <app-loading />
    }
    @if (store.error()) {
      <app-error [message]="store.error()" (retry)="reload()" />
    }
    @if (editing()) {
      <form [formGroup]="form" (ngSubmit)="save()" class="editor">
        @for (field of fields; track field.key) {
          @if (visible(field)) {
            <app-field [forId]="field.key" [label]="field.label" [required]="!!field.required">
              @if (options(field).length || field.key.endsWith('_id')) {
                <select [id]="field.key" [formControlName]="field.key">
                  <option value="">Choose…</option>
                  @for (option of options(field); track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>
              } @else if (
                field.key === 'description' ||
                field.key === 'exercises' ||
                field.key === 'next_priorities'
              ) {
                <textarea [id]="field.key" [formControlName]="field.key" rows="4"></textarea>
              } @else {
                <input
                  [id]="field.key"
                  [type]="field.type === 'money' ? 'text' : field.type || 'text'"
                  [attr.inputmode]="field.type === 'money' ? 'decimal' : null"
                  [formControlName]="field.key"
                  [attr.aria-describedby]="field.key + '-error'"
                />
              }
              @if (form.controls[field.key].invalid && form.controls[field.key].touched) {
                <small [id]="field.key + '-error'" class="validation"
                  >Check {{ field.label.toLowerCase() }}.</small
                >
              }
            </app-field>
          }
        }
        @if (kind === 'transactions') {
          <button type="button" class="text-button" (click)="advanced.set(!advanced())">
            {{ advanced() ? 'Hide' : 'Show' }} optional details
          </button>
        }
        @if (kind === 'tasks') {
          <p class="hint">
            Reminders are visible in the app. Background notification delivery is not configured.
          </p>
        }
        @if (error()) {
          <p role="alert" class="notice">{{ error() }}</p>
        }
        <div class="actions">
          <button class="primary" type="submit" [disabled]="saving()">
            {{ saving() ? 'Saving…' : 'Save ' + feature.singular }}</button
          ><a [routerLink]="back()">Cancel</a>
        </div>
      </form>
    } @else if (item(); as row) {
      <div class="detail-intro">
        <app-status [value]="row.status || row.type || 'Details'" />
        <app-status [value]="store.syncState(row.id)" />
        <p>{{ row.description }}</p>
        <a [routerLink]="[base, row.id, 'edit']" [queryParams]="scope"
          >Edit {{ feature.singular }} ↗</a
        >
      </div>
      @if (kind === 'projects') {
        <section>
          <p class="eyebrow">NEXT STEP</p>
          <h2>{{ nextTask(row.id)?.title || 'Define the first small step' }}</h2>
          <progress
            [value]="completed(row.id)"
            [max]="projectTasks(row.id).length || 1"
            aria-label="Project task completion"
          ></progress>
          <p>{{ completed(row.id) }} of {{ projectTasks(row.id).length }} tasks complete</p>
          <p>Target date Â· {{ row.target_date || 'Not set' }}</p>
          <p>Estimated finish Â· {{ estimate(row) }}</p>
          <a [routerLink]="['/projects', row.id, 'estimates']">View assumptions ↗</a>
        </section>
        <div class="menu">
          @for (link of projectLinks; track link.path) {
            <a [routerLink]="link.path" [queryParams]="{ project: row.id }"
              ><app-row>{{ link.label }}</app-row></a
            >
          }
          <a [routerLink]="[base, row.id, 'edit']"><app-row>Details & setup</app-row></a>
        </div>
        <section>
          <h2>Details</h2>
          @for (field of projectFields; track field.key) {
            @if (row[field.key]) {
              <div class="detail-line">
                <span>{{ field.label }}</span
                ><span>{{ row[field.key] }}</span>
              </div>
            }
          }
          <button class="text-button" (click)="archiveOpen.set(true)">Archive project</button>
        </section>
      } @else if (kind === 'goals') {
        <div class="menu">
          @for (link of goalLinks(row); track link.path) {
            <a [routerLink]="link.path" [queryParams]="{ goal: row.id }"
              ><app-row>{{ link.label }}</app-row></a
            >
          }
        </div>
        @if (row.project_id) {
          <a [routerLink]="['/projects', row.project_id]">Open linked project ↗</a>
        }
        @for (project of linkedProjects(row.id); track project.id) {
          <a [routerLink]="['/projects', project.id]">{{ project.title }} ↗</a>
        }
      } @else {
        <dl>
          @for (field of fields; track field.key) {
            @if (row[field.key]) {
              <div class="detail-line">
                <dt>{{ field.label }}</dt>
                <dd>{{ resolved(field, row) }}</dd>
              </div>
            }
          }
        </dl>
        @if (kind === 'tasks') {
          <div class="actions">
            <button class="primary" (click)="complete(row)">
              {{ row.status === 'done' ? 'Reopen task' : 'Complete task' }}</button
            ><button (click)="today(row)">Add to Today</button>
          </div>
          <a routerLink="/today/reminders/new" [queryParams]="{ task: row.id }"
            >Add linked reminder ↗</a
          >
        }
        @if (kind === 'businesses' || kind === 'ideas') {
          <a routerLink="/goals/prospects" [queryParams]="{ business: row.id }"
            >Customer contacts ↗</a
          >
          <h2>Business transactions</h2>
          @for (transaction of linkedTransactions(row.id); track transaction.id) {
            <a [routerLink]="['/money/transactions', transaction.id]"
              >{{ transaction.title }} · {{ displayAmount(transaction) }}</a
            >
          } @empty {
            <p>No transactions explicitly linked to this business.</p>
          }
        }
        @if (kind === 'savings') {
          <section>
            <h2>Allocated so far</h2>
            <p class="stat">{{ allocated(row.id) }}</p>
            <a routerLink="/money/contributions/new">Add a contribution ↗</a>
          </section>
        }
        @if (kind === 'loans') {
          <section>
            <h2>Repayment history</h2>
            @for (payment of repayments(row.id); track payment.id) {
              <a [routerLink]="['/money/repayments', payment.id]"
                ><app-row>{{ payment.title }} · {{ displayAmount(payment) }}</app-row></a
              >
            } @empty {
              <p>No repayments recorded.</p>
            }
            <a routerLink="/money/repayments/new">Add repayment breakdown ↗</a>
          </section>
        }
        @if (kind === 'accounts') {
          <section>
            <h2>Actual balance</h2>
            <p class="stat">{{ accountBalance(row) }}</p>
          </section>
        }
      }
      @if (kind === 'health_notes') {
        <app-health-attachments [healthRecordId]="row.id" />
      }
    } @else if (id && !store.loading() && !store.error()) {
      <app-empty
        title="Record not found"
        description="This record may have been removed or belongs to another account."
      />
    } @else {
      @if (kind === 'projects' || kind === 'goals') {
        <label class="filter"
          >{{ kind === 'projects' ? 'Status' : 'Goal type'
          }}<select [value]="filter()" (change)="filter.set($any($event.target).value)">
            <option value="all">All</option>
            @for (value of filterOptions; track value) {
              <option [value]="value">{{ value.replaceAll('_', ' ') }}</option>
            }
          </select></label
        >
      }
      @if (kind === 'tasks') {
        <label class="filter"
          ><input
            type="checkbox"
            [checked]="showCompleted()"
            (change)="showCompleted.set($any($event.target).checked)"
          />
          Show completed tasks</label
        >
      }
      @for (row of rows(); track row.id) {
        @if (kind === 'tasks' && isGroupStart(row)) {
          <p class="eyebrow task-group">{{ milestoneName(row.milestone_id) }}</p>
        }
        <a [routerLink]="[base, row.id]" [queryParams]="scope"
          ><app-row
            ><div class="row-top">
              <h2 [class.completed]="row.status === 'done'">{{ row.title }}</h2>
              @if (row.status || row.type) {
                <app-status [value]="row.status || row.type || ''" />
              }
            </div>
            <p>{{ summary(row) }}</p>
            @if (
              row.date &&
              row.date < todayDate &&
              row.status !== 'completed' &&
              row.status !== 'done'
            ) {
              <small>Overdue Â· {{ row.date }}</small>
            }
          </app-row></a
        >
      } @empty {
        @if (!store.loading() && !store.error()) {
          <app-empty
            [title]="'No ' + feature.title.toLowerCase() + ' yet'"
            description="Start with one small entry."
          />
        }
      }
    }
    @if (archiveOpen()) {
      <app-confirm
        title="Archive this project?"
        description="It will be hidden from the project list."
        action="Archive"
        (confirmed)="archive()"
        (cancelled)="archiveOpen.set(false)"
      />
    }
    @if (error() && !editing()) {
      <p role="alert" class="notice">{{ error() }}</p>
    }
  `,
})
export class RecordsPage {
  readonly store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly kind = this.route.snapshot.data['kind'] as EntityKind;
  readonly feature = features[this.kind];
  readonly base = this.route.snapshot.data['base'] as string;
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = signal(this.route.snapshot.data['editing'] === true);
  readonly fields: Field[] =
    this.kind === 'projects' && this.id ? projectFields : this.feature.fields;
  readonly form = new FormGroup<Record<string, FormControl<string>>>({});
  readonly filter = signal('all');
  readonly showCompleted = signal(false);
  readonly error = signal('');
  readonly advanced = signal(false);
  readonly saving = signal(false);
  readonly archiveOpen = signal(false);
  get todayDate() {
    return calendarDate(new Date(), this.store.timezone());
  }
  readonly projectFields = projectFields;
  readonly scope = {
    project: this.route.snapshot.queryParamMap.get('project'),
    goal: this.route.snapshot.queryParamMap.get('goal'),
    business: this.route.snapshot.queryParamMap.get('business'),
  };
  readonly filterOptions =
    this.kind === 'projects'
      ? ['drafted', 'not_started', 'active', 'completed']
      : ['career', 'business', 'personal'];
  readonly projectLinks = [
    { path: '/projects/tasks', label: 'Tasks' },
    { path: '/projects/milestones', label: 'Timeline' },
    { path: '/projects/repositories', label: 'Repositories' },
    { path: '/projects/hosting', label: 'Hosting' },
    { path: '/projects/project_updates', label: 'Updates' },
    { path: '/projects/technologies', label: 'Technologies' },
    { path: '/projects/dependencies', label: 'Task dependencies' },
  ];
  constructor() {
    for (const f of this.fields) {
      const validators = [];
      if (f.required) validators.push(Validators.required, Validators.pattern(/\S/));
      if (f.type === 'money')
        validators.push(
          Validators.pattern(
            this.kind === 'accounts' ? /^-?\d+(\.\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/,
          ),
        );
      if (f.type === 'number') validators.push(Validators.min(0));
      if (f.type === 'url') validators.push(Validators.pattern(/^https:\/\/.+/));
      if (['duration', 'remaining_effort', 'weekly_availability', 'position'].includes(f.key))
        validators.push(Validators.pattern(/^\d+(\.\d+)?$/));
      this.form.addControl(f.key, new FormControl('', { nonNullable: true, validators }));
    }
    void this.initialize();
  }
  async initialize() {
    await this.reload();
    const item = this.item();
    if (item) {
      const values: Record<string, string> = {};
      for (const f of this.fields) {
        const value = String(item[f.key] ?? '');
        values[f.key] =
          f.type === 'datetime-local' && value
            ? localDateTime(value, this.store.timezone()).slice(0, 16)
            : value;
      }
      this.form.patchValue(values);
      if (this.kind === 'categories') this.form.controls['type']?.disable();
    } else {
      for (const field of this.fields)
        if (field.options?.length) this.form.controls[field.key].setValue(field.options[0]);
      this.form.patchValue({
        status: this.fields.find((f) => f.key === 'status')?.options?.[0] || '',
        type: this.fields.find((f) => f.key === 'type')?.options?.[0] || '',
        priority: 'medium',
        date: this.todayDate,
        project_id: this.scope.project || '',
        goal_id: this.scope.goal || '',
        business_id: this.scope.business || '',
        task_id: this.route.snapshot.queryParamMap.get('task') || '',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        start_date: this.todayDate,
        period_end:
          this.todayDate.slice(0, 7) +
          '-' +
          new Date(
            Number(this.todayDate.slice(0, 4)),
            Number(this.todayDate.slice(5, 7)),
            0,
          ).getDate(),
        current_level: '0',
        weekly_availability: '0',
        interest_amount: '0.00',
        fee_amount: '0.00',
        position: '0',
      });
      if (this.kind === 'reviews') {
        const d = new Date(this.todayDate + 'T12:00:00Z');
        d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
        this.form.patchValue({ date: d.toISOString().slice(0, 10) });
      }
    }
  }
  async reload() {
    await this.store.load(
      this.kind,
      ...(
        [
          'tasks',
          'projects',
          'goals',
          'milestones',
          'transactions',
          'accounts',
          'categories',
          'savings',
          'contributions',
          'loans',
          'repayments',
          'businesses',
          'career_plans',
          'skills',
          'appointments',
          'medications',
          'bills',
          'attendance',
          'exercises',
          'dependencies',
          'goal_projects',
        ] as EntityKind[]
      ).filter((k) => k !== this.kind),
    );
  }
  item() {
    return this.store.rows(this.kind).find((r) => r.id === this.id);
  }
  heading() {
    return this.editing()
      ? (this.id ? 'Edit ' : 'New ') + this.feature.singular
      : this.item()?.title || this.feature.title;
  }
  back() {
    return this.id && !this.editing()
      ? this.base
      : this.id
        ? [this.base, this.id].join('/')
        : this.editing()
          ? this.base
          : '/' + this.base.split('/')[1];
  }
  parentLabel() {
    return this.id ? this.feature.title : 'Overview';
  }
  rows() {
    let rows = this.store.rows(this.kind).filter((r) => !r.archived);
    if (this.filter() !== 'all')
      rows = rows.filter((r) => (this.kind === 'projects' ? r.status : r.type) === this.filter());
    if (this.scope.project) rows = rows.filter((r) => r.project_id === this.scope.project);
    if (this.scope.business && this.kind === 'prospects')
      rows = rows.filter((r) => r['business_id'] === this.scope.business);
    if (
      this.scope.goal &&
      ['tasks', 'interviews', 'milestones', 'career_plans', 'goal_projects'].includes(this.kind)
    )
      rows = rows.filter((r) => r.goal_id === this.scope.goal);
    if (this.scope.goal && ['skills', 'learning', 'evidence'].includes(this.kind)) {
      const plans = this.store
        .rows('career_plans')
        .filter((p) => p.goal_id === this.scope.goal)
        .map((p) => p.id);
      const skills = this.store
        .rows('skills')
        .filter((s) => plans.includes(String(s['career_plan_id'])))
        .map((s) => s.id);
      rows = rows.filter((r) =>
        this.kind === 'skills'
          ? plans.includes(String(r['career_plan_id']))
          : skills.includes(String(r['career_skill_id'])),
      );
    }
    if (this.kind === 'tasks' && !this.showCompleted())
      rows = rows.filter((r) => !['done', 'cancelled'].includes(r.status || ''));
    return rows.sort((a, b) =>
      this.kind === 'milestones'
        ? Number(a['position'] || 0) - Number(b['position'] || 0)
        : this.kind === 'tasks'
          ? (a.milestone_id || '').localeCompare(b.milestone_id || '')
          : a.created_at.localeCompare(b.created_at),
    );
  }
  isGroupStart(row: RecordData) {
    const rows = this.rows();
    const index = rows.findIndex((r) => r.id === row.id);
    return index === 0 || rows[index - 1].milestone_id !== row.milestone_id;
  }
  milestoneName(id?: string) {
    return this.store.rows('milestones').find((m) => m.id === id)?.title || 'No milestone';
  }
  projectTasks(id: string) {
    return this.store.rows('tasks').filter((r) => r.project_id === id && r.status !== 'cancelled');
  }
  nextTask(id: string) {
    return this.projectTasks(id).find((t) => t.status !== 'done');
  }
  completed(id: string) {
    return this.projectTasks(id).filter((t) => t.status === 'done').length;
  }
  summary(row: RecordData) {
    if (this.kind === 'projects')
      return 'Next: ' + (this.nextTask(row.id)?.title || 'Define the next action');
    if (row.amount) return this.displayAmount(row) + ' Â· ' + (row.date || '');
    if (this.kind === 'tasks')
      return (
        (row.date || 'Unscheduled') +
        ' Â· ' +
        (row.priority || 'medium') +
        ' priority' +
        (row.milestone_id
          ? ' Â· ' +
            (this.store.rows('milestones').find((m) => m.id === row.milestone_id)?.title ||
              'Milestone')
          : '')
      );
    return row.description || row.date || row.target_role || row.url || 'Open details';
  }
  displayAmount(row: RecordData) {
    try {
      return money(minorUnits(row.amount || '0'));
    } catch {
      return 'Invalid amount';
    }
  }
  options(field: Field): { label: string; value: string }[] {
    if (field.options)
      return field.options.map((value) => ({ value, label: value.replaceAll('_', ' ') }));
    const map: Record<string, EntityKind> = {
      project_id: 'projects',
      goal_id: 'goals',
      account_id: 'accounts',
      destination_account_id: 'accounts',
      category_id: 'categories',
      milestone_id: 'milestones',
      savings_goal_id: 'savings',
      loan_id: 'loans',
      transaction_id: 'transactions',
      business_id: 'businesses',
      career_plan_id: 'career_plans',
      career_skill_id: 'skills',
      task_id: 'tasks',
      depends_on_task_id: 'tasks',
      appointment_id: 'appointments',
      medication_id: 'medications',
      recurring_payment_id: 'bills',
      gym_session_id: 'attendance',
      exercise_id: 'exercises',
    };
    if (!map[field.key]) return [];
    let choices = this.store.rows(map[field.key]);
    if (field.key === 'milestone_id')
      choices = choices.filter(
        (r) => r.project_id && r.project_id === this.form.controls['project_id']?.value,
      );
    if (field.key === 'category_id')
      choices = choices.filter(
        (r) => r.type === (this.kind === 'budgets' ? 'expense' : this.form.controls['type']?.value),
      );
    if (field.key === 'transaction_id' && this.kind === 'repayments')
      choices = choices.filter((r) => r.type === 'expense');
    if (field.key === 'goal_id' && this.kind === 'career_plans')
      choices = choices.filter((r) => r.type === 'career');
    if (field.key === 'career_plan_id' && this.scope.goal)
      choices = choices.filter((r) => r.goal_id === this.scope.goal);
    if (field.key === 'career_skill_id' && this.scope.goal) {
      const plans = this.store
        .rows('career_plans')
        .filter((p) => p.goal_id === this.scope.goal)
        .map((p) => p.id);
      choices = choices.filter((s) => plans.includes(String(s['career_plan_id'])));
    }
    return choices.map((r) => ({ value: r.id, label: r.title }));
  }
  visible(f: Field) {
    if (this.kind === 'milestones') {
      const goal = !!this.form.controls['goal_id']?.value;
      if (['start_date', 'position'].includes(f.key)) return !goal;
      if (f.key === 'completed_at') return goal;
    }
    if (this.kind === 'transactions') {
      if (f.key === 'destination_account_id')
        return this.form.controls['type']?.value === 'transfer';
      if (f.key === 'category_id') return this.form.controls['type']?.value !== 'transfer';
      if (['project_id', 'business_id'].includes(f.key)) return this.advanced();
    }
    return true;
  }
  resolved(field: Field, row: RecordData) {
    return this.options(field).find((o) => o.value === row[field.key])?.label || row[field.key];
  }
  async save() {
    this.form.markAllAsTouched();
    this.error.set('');
    if (this.form.invalid) return;
    const values = this.form.getRawValue();
    const current = this.item();
    for (const field of this.fields) {
      const previous = String(current?.[field.key] || '');
      if (
        field.type === 'datetime-local' &&
        previous &&
        values[field.key] === localDateTime(previous, this.store.timezone()).slice(0, 16)
      )
        values[field.key] = previous;
    }
    if (
      this.kind === 'reminders' &&
      ['task_id', 'appointment_id', 'medication_id', 'recurring_payment_id'].filter(
        (k) => values[k],
      ).length > 1
    ) {
      this.error.set('Choose at most one linked record for this reminder.');
      return;
    }
    if (this.kind === 'transactions') {
      if (minorUnits(values['amount']) <= 0n) {
        this.error.set('Amount must be greater than zero.');
        return;
      }
      if (
        values['type'] === 'transfer' &&
        (!values['destination_account_id'] ||
          values['destination_account_id'] === values['account_id'])
      ) {
        this.error.set('Choose a different destination account.');
        return;
      }
      if (values['type'] === 'transfer') values['category_id'] = '';
      else values['destination_account_id'] = '';
    }
    if (this.kind === 'profiles') {
      try {
        new Intl.DateTimeFormat('en', { timeZone: values['timezone'] });
      } catch {
        this.error.set('Enter a valid IANA timezone.');
        return;
      }
    }
    this.saving.set(true);
    try {
      if (this.kind === 'projects' && !this.id) values['status'] = 'drafted';
      if (values['reminder_at'])
        values['reminder_at'] = toInstant(values['reminder_at'], this.store.timezone());
      const saved = await this.store.save(this.kind, values, this.item());
      await this.router.navigate([this.base, saved.id], { queryParams: this.scope });
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Unable to save.');
    } finally {
      this.saving.set(false);
    }
  }
  async complete(row: RecordData) {
    try {
      await this.store.save(
        'tasks',
        { ...row, status: row.status === 'done' ? 'todo' : 'done' },
        row,
      );
    } catch (e) {
      this.error.set(String(e));
    }
  }
  async today(row: RecordData) {
    try {
      await this.store.save('tasks', { ...row, date: this.todayDate }, row);
    } catch (e) {
      this.error.set(String(e));
    }
  }
  async archive() {
    const row = this.item();
    if (row) {
      await this.store.save('projects', { ...row, archived: true }, row);
      await this.router.navigate(['/projects']);
    }
  }
  estimate(row: RecordData) {
    const tasks = this.projectTasks(row.id).filter((t) => t.status !== 'done');
    const hours = Number(row.weekly_availability);
    if (!hours || !tasks.length || tasks.some((t) => !t.remaining_effort)) return 'Add estimates';
    if (
      tasks.some(
        (t) =>
          t.status === 'blocked' ||
          t.blockers ||
          this.store
            .rows('dependencies')
            .some(
              (d) =>
                d['task_id'] === t.id &&
                this.store.rows('tasks').find((parent) => parent.id === d['depends_on_task_id'])
                  ?.status !== 'done',
            ),
      )
    )
      return 'Uncertain Â· blocked work';
    const minutes = tasks.reduce((n, t) => n + Number(t.remaining_effort), 0);
    const finish = new Date();
    finish.setDate(finish.getDate() + Math.ceil((minutes / (hours * 60)) * 7));
    return calendarDate(finish);
  }
  goalLinks(row: RecordData) {
    return (
      row.type === 'business'
        ? ['tasks', 'milestones', 'goal_projects', 'businesses', 'prospects', 'ideas']
        : [
            'tasks',
            'milestones',
            'goal_projects',
            'career_plans',
            'skills',
            'learning',
            'evidence',
            'interviews',
            'applications',
          ]
    ).map((key) => ({ path: '/goals/' + key, label: features[key].title }));
  }
  linkedTransactions(id: string) {
    return this.store.rows('transactions').filter((t) => t['business_id'] === id);
  }
  linkedProjects(id: string) {
    const ids = this.store
      .rows('goal_projects')
      .filter((link) => link.goal_id === id)
      .map((link) => link.project_id);
    return this.store.rows('projects').filter((project) => ids.includes(project.id));
  }
  allocated(id: string) {
    return money(
      this.store
        .rows('contributions')
        .filter((c) => c['savings_goal_id'] === id)
        .reduce((sum, c) => sum + minorUnits(c.amount || '0'), 0n),
    );
  }
  repayments(id: string) {
    return this.store.rows('repayments').filter((r) => r['loan_id'] === id);
  }
  accountBalance(row: RecordData) {
    let total = minorUnits(row.amount || '0');
    for (const t of this.store.rows('transactions')) {
      const amount = minorUnits(t.amount || '0');
      if (t.account_id === row.id) total += t.type === 'income' ? amount : -amount;
      if (t.type === 'transfer' && t.destination_account_id === row.id) total += amount;
    }
    return money(total);
  }
}
