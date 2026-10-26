import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '../core/store';
import { calendarDate, money, minorUnits, RecordData, totals } from '../core/models';
import { EmptyState, ListRow, PageHeader } from '../shared/ui';
@Component({
  standalone: true,
  imports: [RouterLink, PageHeader, ListRow, EmptyState],
  template: `
    @switch (page) {
      @case ('today') {
        <app-header title="Today" subtitle="A little focus. A little forward." [eyebrow]="dateLabel"
          ><a class="primary" routerLink="/today/tasks/new">+ Add task</a></app-header
        >
        <section class="first-section">
          <div class="section-heading">
            <h2>Your priorities</h2>
            <span>{{ priorities().length }} for today</span>
          </div>
          @for (task of priorities(); track task.id) {
            <div class="task-row">
              <button
                class="check"
                [attr.aria-label]="'Complete ' + task.title"
                (click)="complete(task)"
              ></button
              ><a [routerLink]="['/today/tasks', task.id]"
                ><h3>{{ task.title }}</h3>
                <p>
                  {{ task.duration ? task.duration + ' min · ' : ''
                  }}{{ projectName(task.project_id) || 'Personal' }} ·
                  {{ task.priority || 'medium' }}
                </p></a
              >
            </div>
          } @empty {
            <app-empty title="A clear day" description="Choose a task that matters to you." />
          }
          <a class="inline-link" routerLink="/today/planner">Open day planner <span>↗</span></a>
        </section>
        <section>
          <p class="eyebrow">UP NEXT</p>
          @if (reminder(); as r) {
            <h2>{{ r.title }}</h2>
            <p>{{ r.date }} · In-app reminder</p>
            <a [routerLink]="reminderPath(r)">View reminder ↗</a>
          } @else {
            <p>No upcoming reminders.</p>
          }
          <a class="inline-link" routerLink="/today/reminders">All reminders ↗</a>
        </section>
        @if (nextAction(); as task) {
          <section>
            <p class="eyebrow">KEEP IT MOVING</p>
            <a [routerLink]="['/today/tasks', task.id]"
              ><h2>{{ task.title }} ↗</h2>
              <p>{{ projectName(task.project_id) || 'Your next goal action' }}</p></a
            >
          </section>
        }
        <a class="assistant-link" routerLink="/assistant"
          ><span aria-hidden="true">✳</span> Ask assistant <span>↗</span></a
        >
      }
      @case ('money') {
        <app-header title="Money" subtitle="Know where you stand."
          ><a class="primary" routerLink="/money/transactions/new">+ Add transaction</a></app-header
        >
        <label class="filter"
          >Month<input
            type="month"
            [value]="month()"
            (change)="month.set($any($event.target).value)"
        /></label>
        <section class="balance">
          <p class="eyebrow">BUDGET REMAINING · ACTUAL</p>
          <p class="stat">{{ remaining() }}</p>
          <div class="money-totals">
            <p>
              Income<strong>{{ money(total().income) }}</strong>
            </p>
            <p>
              Expenses<strong>{{ money(total().expense) }}</strong>
            </p>
          </div>
        </section>
        <section>
          <div class="section-heading">
            <h2>Recent transactions</h2>
            <a routerLink="/money/transactions">View all ↗</a>
          </div>
          @for (t of transactions().slice(-4).reverse(); track t.id) {
            <a [routerLink]="['/money/transactions', t.id]"
              ><app-row
                ><div class="row-top">
                  <h3>{{ t.title }}</h3>
                  <span
                    >{{ t.type === 'income' ? '+' : t.type === 'expense' ? '−' : ''
                    }}{{ money(minorUnits(t.amount || '0')) }}</span
                  >
                </div>
                <p>{{ t.type }} · {{ t.date }} · {{ store.syncState(t.id) }}</p></app-row
              ></a
            >
          } @empty {
            <app-empty title="No transactions this month" />
          }
        </section>
        <div class="menu">
          @for (link of moneyLinks; track link.path) {
            <a [routerLink]="link.path"
              ><app-row>{{ link.label }}</app-row></a
            >
          }
        </div>
      }
      @case ('me') {
        <app-header title="Me" subtitle="Make room for yourself." />
        <section class="profile-intro">
          <div class="avatar" aria-hidden="true">{{ profileName().slice(0, 1) }}</div>
          <div>
            <h2>{{ profileName() }}</h2>
            <p>{{ store.isDemo() ? 'Your fictional demo space' : 'Your private space' }}</p>
          </div>
        </section>
        <div class="menu">
          @for (link of meLinks; track link.path) {
            <a [routerLink]="link.path"
              ><app-row
                ><h2>{{ link.label }}</h2>
                <p>{{ link.description }}</p></app-row
              ></a
            >
          }
        </div>
      }
      @case ('health') {
        <a class="back" routerLink="/me">← Me</a
        ><app-header title="Health" subtitle="A private place for your records." />
        <div class="menu">
          @for (link of healthLinks; track link.path) {
            <a [routerLink]="link.path"
              ><app-row>{{ link.label }}</app-row></a
            >
          }
        </div>
        <section>
          <h2>Private reports</h2>
          <p>Open a saved health record to upload or preview its private reports.</p>
          <a routerLink="/me/health_notes">Open health records ↗</a>
        </section>
      }
      @case ('gym') {
        <a class="back" routerLink="/me">← Me</a
        ><app-header title="Gym" subtitle="Keep showing up."
          ><a class="primary" routerLink="/me/attendance/new">+ Mark attendance</a></app-header
        >
        <section>
          <p class="eyebrow">THIS WEEK</p>
          <p class="stat">{{ weeklyAttendance().length }} sessions</p>
          <div class="week-strip">
            @for (day of weekDays; track day) {
              <div>
                <span>{{ day.slice(8) }}</span
                ><span>{{ attended(day) ? '●' : '○' }}</span>
              </div>
            }
          </div>
        </section>
        <div class="menu">
          <a routerLink="/me/attendance"><app-row>Attendance & session feedback</app-row></a
          ><a routerLink="/me/workouts"><app-row>Workout sets</app-row></a
          ><a routerLink="/me/exercises"><app-row>Exercise library</app-row></a>
        </div>
        <section>
          <h2>Attendance calendar</h2>
          <label class="filter"
            >Month<input
              type="month"
              [value]="month()"
              (change)="month.set($any($event.target).value)"
          /></label>
          <div class="calendar">
            @for (day of calendarDays(); track $index) {
              <div [class.attended]="day && attended(day)">
                {{ day ? day.slice(8) : '' }}
                @if (day && attended(day)) {
                  <small>Attended</small>
                }
              </div>
            }
          </div>
        </section>
      }
      @case ('review') {
        <a class="back" routerLink="/me">← Me</a
        ><app-header title="Weekly review" subtitle="Pause. Notice. Begin again."
          ><a class="primary" routerLink="/me/reviews/new">Write reflection</a></app-header
        >
        <section>
          <h2>The week in view</h2>
          <div class="detail-line">
            <span>Tasks completed</span><span>{{ completedThisWeek() }}</span>
          </div>
          <div class="detail-line">
            <span>Actual income</span><span>{{ money(weekFinance().income) }}</span>
          </div>
          <div class="detail-line">
            <span>Actual spending</span><span>{{ money(weekFinance().expense) }}</span>
          </div>
          <div class="detail-line">
            <span>Gym sessions</span><span>{{ weeklyAttendance().length }}</span>
          </div>
        </section>
        <section>
          <h2>Projects & goals</h2>
          @for (p of store.rows('projects'); track p.id) {
            <a [routerLink]="['/projects', p.id]"
              ><app-row>{{ p.title }} · {{ p.status }}</app-row></a
            >
          }
          @for (g of store.rows('goals'); track g.id) {
            <a [routerLink]="['/goals', g.id]"
              ><app-row>{{ g.title }}</app-row></a
            >
          }
        </section>
        <section>
          <h2>Upcoming follow-ups</h2>
          @for (r of followups(); track r.id) {
            <p>{{ r.title }} · {{ r.date }}</p>
          } @empty {
            <p>No upcoming follow-ups.</p>
          }
        </section>
        <a routerLink="/me/reviews">Read & edit reflections ↗</a>
      }
      @case ('settings') {
        <a class="back" routerLink="/me">← Me</a
        ><app-header title="Settings" subtitle="The essentials, your way." />
        <div class="menu">
          <a [routerLink]="profilePath()"><app-row>Display name, timezone & currency</app-row></a
          ><a routerLink="/me/notifications"><app-row>Notification preferences</app-row></a
          ><a routerLink="/me/install"><app-row>Install MyCompass</app-row></a
          ><a routerLink="/me/sync"><app-row>Offline & synchronization</app-row></a
          ><button class="menu-button" (click)="exportData()">Export loaded data ↓</button>
        </div>
        <section><button (click)="signOut()">Sign out</button></section>
      }
      @case ('install') {
        <a class="back" routerLink="/me/settings">← Settings</a
        ><app-header title="Make it yours" subtitle="Install MyCompass" />
        <p>
          Open the browser menu and choose “Install app” or “Add to Home Screen”. On iPhone, use
          Safari’s Share menu.
        </p>
        <p>
          Installation requires HTTPS or localhost and a production build. The shell works offline
          after your first visit. Private API responses and medical files are not cached.
        </p>
      }
      @case ('notifications') {
        <a class="back" routerLink="/me/settings">← Settings</a
        ><app-header title="Notifications" subtitle="Stay informed, on your terms." />
        <p>
          Background reminder delivery is not configured. Reminders are available inside MyCompass.
        </p>
        <label class="filter"
          ><input
            type="checkbox"
            [checked]="inAppReminders()"
            (change)="savePreference($any($event.target).checked)"
          />
          Show in-app reminder notices</label
        >
      }
      @case ('sync') {
        <a class="back" routerLink="/me/settings">← Settings</a
        ><app-header title="Offline & sync" subtitle="Your pending work stays with your account." />
        <p>
          Offline task and transaction capture is available in live mode. Other forms require a
          connection. Demo records are saved locally.
        </p>
        <button (click)="store.retry()" [disabled]="store.isDemo()">Retry pending changes</button>
        @for (p of store.pending(); track p.id) {
          <app-row
            ><h2>{{ p.row.title }}</h2>
            <p>{{ p.state }} · {{ p.error }}</p>
            @if (p.state === 'conflict') {
              <p>
                Automatic retry stopped. Open the latest record online and reapply your change after
                review.
              </p>
            }
          </app-row>
        } @empty {
          <p>No pending changes for this account.</p>
        }
      }
      @case ('reports') {
        <a class="back" routerLink="/money">← Money</a
        ><app-header title="Reports" subtitle="Actual transactions. A clearer perspective." /><label
          class="filter"
          >Period<select [value]="period()" (change)="period.set($any($event.target).value)">
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select></label
        >
        <section>
          @for (t of reportTotals(); track t.label) {
            <div class="detail-line">
              <span>{{ t.label }}</span
              ><span>{{ money(t.value) }}</span>
            </div>
            <div class="report-bar" [style.width.%]="barWidth(t.value)"></div>
          }
        </section>
        <p>
          Transfers, savings allocations, loan breakdowns and recurring forecasts are excluded.
          Bills are forecasts only.
        </p>
        <a routerLink="/money/bills">View forecast bills ↗</a>
      }
      @case ('estimates') {
        <a class="back" [routerLink]="['/projects', projectId]">← Project</a
        ><app-header title="Estimate assumptions" subtitle="Effort, not task count." />
        <p>
          Estimated finish uses the total remaining minutes on unfinished tasks divided by weekly
          available hours, spread across seven calendar days per week.
        </p>
        <p>
          Every unfinished task needs remaining effort, and the project needs weekly availability.
          Blocked work makes the schedule uncertain. This is a planning estimate, not a promise.
        </p>
      }
      @case ('updates') {
        <a class="back" routerLink="/projects">← Projects</a
        ><app-header title="Project updates" subtitle="Changes recorded in your project." />
        @for (t of projectUpdates(); track t.id) {
          <app-row
            ><h2>{{ t.description }}</h2>
            <p>{{ t['new_status'] }} · Updated {{ t.updated_at.slice(0, 10) }}</p></app-row
          >
        } @empty {
          <p>No project updates yet.</p>
        }
      }
    }
    @if (store.error()) {
      <p role="alert" class="notice">{{ store.error() }}</p>
      <button (click)="load()">Try again</button>
    }
  `,
})
export class OverviewPage {
  readonly store = inject(Store);
  private route = inject(ActivatedRoute);
  readonly page = this.route.snapshot.data['page'];
  readonly projectId = this.route.snapshot.paramMap.get('id');
  get today() {
    return calendarDate(new Date(), this.store.timezone());
  }
  readonly month = signal(this.today.slice(0, 7));
  readonly period = signal('month');
  readonly money = money;
  readonly minorUnits = minorUnits;
  get dateLabel() {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: this.store.timezone(),
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
      .format(new Date())
      .toUpperCase();
  }
  get weekStart() {
    const d = new Date(this.today + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  }
  get weekDays() {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart + 'T12:00:00Z');
      d.setUTCDate(d.getUTCDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }
  readonly moneyLinks = [
    'accounts',
    'categories',
    'budgets',
    'savings',
    'contributions',
    'bills',
    'loans',
    'repayments',
    'reports',
  ].map((key) => ({
    path: '/money/' + key,
    label:
      key === 'bills'
        ? 'Recurring bills'
        : key === 'repayments'
          ? 'Repayment history'
          : key[0].toUpperCase() + key.slice(1),
  }));
  readonly meLinks = [
    { path: '/me/health', label: 'Health', description: 'Records, appointments & reminders' },
    { path: '/me/gym', label: 'Gym', description: 'Consistency, one session at a time' },
    { path: '/me/review', label: 'Weekly review', description: 'Reflect on the week that was' },
    { path: '/me/settings', label: 'Settings', description: 'Your profile & preferences' },
  ];
  readonly healthLinks = [
    { path: '/me/appointments', label: 'Appointments & follow-ups' },
    { path: '/me/health_notes', label: 'Health notes' },
    { path: '/me/medications', label: 'Medication records' },
  ];
  readonly inAppReminders = signal(localStorage.getItem('mycompass.reminders') !== 'off');
  constructor() {
    void this.load();
  }
  async load() {
    await this.store.load(
      'tasks',
      'projects',
      'goals',
      'reminders',
      'transactions',
      'budgets',
      'profiles',
      'attendance',
      'applications',
      'prospects',
      'appointments',
      'medications',
      'project_updates',
    );
  }
  priorities() {
    return this.store
      .rows('tasks')
      .filter(
        (t) =>
          !['done', 'cancelled'].includes(t.status || '') &&
          (t.date === this.today ||
            (!!t['due_at'] &&
              calendarDate(new Date(String(t['due_at'])), this.store.timezone()) <= this.today)),
      )
      .sort((a, b) => (a.priority === 'high' ? 0 : 1) - (b.priority === 'high' ? 0 : 1))
      .slice(0, 3);
  }
  reminder() {
    return this.inAppReminders()
      ? [
          ...this.store
            .rows('reminders')
            .filter(
              (r) =>
                r.status === 'pending' &&
                !!r.reminder_at &&
                Date.parse(r.reminder_at) < Date.now() + 7 * 86400000,
            ),
          ...this.store
            .rows('tasks')
            .filter((t) => t.reminder_at && !['done', 'cancelled'].includes(t.status || '')),
          ...this.store.rows('medications').filter((t) => t.reminder_at),
        ]
          .map((r) => ({
            ...r,
            date: r.reminder_at
              ? calendarDate(new Date(r.reminder_at), this.store.timezone())
              : r.date,
          }))
          .sort((a, b) =>
            (a.reminder_at || a.date || '').localeCompare(b.reminder_at || b.date || ''),
          )[0]
      : undefined;
  }
  nextAction() {
    return this.store
      .rows('tasks')
      .find(
        (t) =>
          (t.project_id || t.goal_id) &&
          !['done', 'cancelled'].includes(t.status || '') &&
          !this.priorities().some((p) => p.id === t.id),
      );
  }
  projectName(id?: string) {
    return this.store.rows('projects').find((p) => p.id === id)?.title;
  }
  async complete(t: RecordData) {
    try {
      await this.store.save('tasks', { status: 'done' }, t);
    } catch (e) {
      this.store.error.set(String(e));
    }
  }
  transactions() {
    return this.store.rows('transactions').filter((t) => t.date?.startsWith(this.month()));
  }
  total() {
    return totals(this.transactions());
  }
  remaining() {
    const start = this.month() + '-01',
      end =
        this.month() +
        '-' +
        new Date(Number(this.month().slice(0, 4)), Number(this.month().slice(5, 7)), 0).getDate();
    const all = this.store
      .rows('budgets')
      .filter((b) => (b.date || '') <= end && String(b['period_end'] || '') >= start);
    if (!all.length) return 'Set a budget';
    if (all.length !== 1) return 'View category budgets';
    const budget = all[0];
    const spent = this.store
      .rows('transactions')
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category_id === budget.category_id &&
          (t.date || '') >= (budget.date || '') &&
          (t.date || '') <= String(budget['period_end'] || ''),
      );
    return money(minorUnits(budget.amount || '0') - totals(spent).expense);
  }

  profileName() {
    return this.store.rows('profiles')[0]?.title || 'Your profile';
  }
  profilePath() {
    const p = this.store.rows('profiles')[0];
    return p ? '/me/profiles/' + p.id + '/edit' : '/me/profiles/new';
  }
  weeklyAttendance() {
    return this.store
      .rows('attendance')
      .filter((a) => (a.date || '') >= this.weekStart && (a.date || '') <= this.weekDays[6]);
  }
  reminderPath(row: RecordData) {
    return [
      this.store.rows('tasks').some((t) => t.id === row.id)
        ? '/today/tasks'
        : this.store.rows('medications').some((t) => t.id === row.id)
          ? '/me/medications'
          : '/today/reminders',
      row.id,
    ];
  }
  calendarDays() {
    const [year, month] = this.month().split('-').map(Number);
    const first = new Date(year, month - 1, 1, 12);
    const offset = (first.getDay() + 6) % 7;
    return [
      ...Array.from({ length: offset }, () => ''),
      ...Array.from(
        { length: new Date(year, month, 0).getDate() },
        (_, i) => this.month() + '-' + String(i + 1).padStart(2, '0'),
      ),
    ];
  }
  attended(day: string) {
    return this.store.rows('attendance').some((a) => a.date === day);
  }
  completedThisWeek() {
    return this.store
      .rows('tasks')
      .filter(
        (t) =>
          t.status === 'done' &&
          !!t['completed_at'] &&
          calendarDate(new Date(String(t['completed_at'])), this.store.timezone()) >=
            this.weekStart &&
          calendarDate(new Date(String(t['completed_at'])), this.store.timezone()) <=
            this.weekDays[6],
      ).length;
  }
  weekFinance() {
    return totals(
      this.store
        .rows('transactions')
        .filter((t) => (t.date || '') >= this.weekStart && (t.date || '') <= this.weekDays[6]),
    );
  }
  followups() {
    return [
      ...this.store.rows('applications'),
      ...this.store.rows('prospects'),
      ...this.store.rows('appointments'),
    ].filter((r) => String(r['follow_up_date'] || r.date || '') >= this.today);
  }
  reportTotals() {
    const prefix = this.period() === 'year' ? this.today.slice(0, 4) : this.today.slice(0, 7);
    const values = totals(
      this.store
        .rows('transactions')
        .filter((t) =>
          this.period() === 'week'
            ? (t.date || '') >= this.weekStart && (t.date || '') <= this.weekDays[6]
            : t.date?.startsWith(prefix),
        ),
    );
    return [
      { label: 'Income', value: values.income },
      { label: 'Expenses', value: values.expense },
    ];
  }
  barWidth(value: bigint) {
    const max = this.reportTotals().reduce((m, r) => (r.value > m ? r.value : m), 1n);
    return Number((value * 100n) / max);
  }
  projectUpdates() {
    const id = this.route.snapshot.queryParamMap.get('project');
    return this.store.rows('project_updates').filter((t) => t.project_id === id);
  }
  savePreference(value: boolean) {
    localStorage.setItem('mycompass.reminders', value ? 'on' : 'off');
    this.inAppReminders.set(value);
    this.store.message.set('In-app reminder preference saved on this device.');
  }
  exportData() {
    const blob = new Blob([JSON.stringify(this.store.data(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mycompass-loaded-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  async signOut() {
    try {
      await this.store.auth.signOut();
      this.store.clear();
      location.assign('/auth');
    } catch (e) {
      this.store.error.set(String(e));
    }
  }
}
