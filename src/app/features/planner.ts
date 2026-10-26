import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '../core/store';
import { calendarDate, RecordData } from '../core/models';
import { PageHeader } from '../shared/ui';
@Component({
  standalone: true,
  imports: [RouterLink, PageHeader],
  template: `<a class="back" routerLink="/today">← Today</a
    ><app-header title="Day planner" subtitle="Give your day a little shape."
      ><a routerLink="/today/tasks/new" class="primary">+ Add task</a></app-header
    >
    <div class="planner-controls">
      <label
        >Day<input
          type="date"
          [value]="selected()"
          (change)="selected.set($any($event.target).value)" /></label
      ><label
        >View<select [value]="view()" (change)="view.set($any($event.target).value)">
          <option value="day">Day</option>
          <option value="week">Week</option>
        </select></label
      >
    </div>
    @for (group of groups(); track group.date) {
      <section>
        <h2>{{ group.date === 'unscheduled' ? 'Unscheduled' : group.date }}</h2>
        @for (task of group.tasks; track task.id) {
          <div class="task-row">
            <button
              class="check"
              [class.checked]="task.status === 'done'"
              [attr.aria-label]="(task.status === 'done' ? 'Reopen ' : 'Complete ') + task.title"
              (click)="toggle(task)"
            >
              {{ task.status === 'done' ? '✓' : '' }}
            </button>
            <div>
              <a [routerLink]="['/today/tasks', task.id]"
                ><h3>{{ task.title }}</h3></a
              >
              <p>{{ task.duration || 'No' }} minutes · {{ task.status }}</p>
              <a [routerLink]="['/today/tasks', task.id, 'edit']">Edit / reschedule ↗</a>
            </div>
          </div>
        } @empty {
          <p>No tasks planned.</p>
        }
      </section>
    }
    <a routerLink="/today/tasks">Browse all tasks ↗</a>
    @if (store.error()) {
      <p role="alert">{{ store.error() }}</p>
    }`,
})
export class PlannerPage {
  readonly store = inject(Store);
  readonly selected = signal(calendarDate());
  readonly view = signal('day');
  constructor() {
    void this.store
      .load('tasks')
      .then(() => this.selected.set(calendarDate(new Date(), this.store.timezone())));
  }
  groups() {
    const first = new Date(this.selected() + 'T12:00:00Z');
    if (this.view() === 'week')
      first.setUTCDate(first.getUTCDate() - ((first.getUTCDay() + 6) % 7));
    const dates = Array.from({ length: this.view() === 'day' ? 1 : 7 }, (_, i) => {
      const d = new Date(first);
      d.setUTCDate(d.getUTCDate() + i);
      return d.toISOString().slice(0, 10);
    });
    return [...dates, 'unscheduled'].map((date) => ({
      date,
      tasks: this.store
        .rows('tasks')
        .filter(
          (t) => t.status !== 'cancelled' && (date === 'unscheduled' ? !t.date : t.date === date),
        ),
    }));
  }
  async toggle(task: RecordData) {
    try {
      await this.store.save('tasks', { status: task.status === 'done' ? 'todo' : 'done' }, task);
    } catch (e) {
      this.store.error.set(String(e));
    }
  }
}
