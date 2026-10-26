import { Component, computed, input } from '@angular/core';
import { CalendarDays, Wallet, Folder, Flag, UserRound } from 'lucide';
@Component({
  selector: 'app-icon',
  template: `<svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    @for (node of nodes(); track $index) {
      @switch (node[0]) {
        @case ('path') {
          <svg:path [attr.d]="node[1]['d']" />
        }
        @case ('rect') {
          <svg:rect
            [attr.x]="node[1]['x']"
            [attr.y]="node[1]['y']"
            [attr.width]="node[1]['width']"
            [attr.height]="node[1]['height']"
            [attr.rx]="node[1]['rx']"
          />
        }
        @case ('circle') {
          <svg:circle [attr.cx]="node[1]['cx']" [attr.cy]="node[1]['cy']" [attr.r]="node[1]['r']" />
        }
        @case ('line') {
          <svg:line
            [attr.x1]="node[1]['x1']"
            [attr.y1]="node[1]['y1']"
            [attr.x2]="node[1]['x2']"
            [attr.y2]="node[1]['y2']"
          />
        }
      }
    }
  </svg>`,
})
export class Icon {
  name = input('today');
  nodes = computed(
    () =>
      ({ today: CalendarDays, money: Wallet, projects: Folder, goals: Flag, me: UserRound })[
        this.name()
      ] || CalendarDays,
  );
}
