import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';
import { Store } from './core/store';
import { Icon } from './shared/icon';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  template: `
    <a href="#main" class="skip-link">Skip to content</a>
    @if (auth.mode() !== 'none') {
      <aside class="sidebar">
        <a routerLink="/today" class="wordmark">◈ <span>MyCompass</span></a>
        <p class="sidebar-caption">A little more intentional.</p>
        <nav aria-label="Main navigation">
          @for (item of navigation; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" ariaCurrentWhenActive="page"
              ><app-icon [name]="item.icon" /><span>{{ item.label }}</span></a
            >
          }
        </nav>
        <div class="sidebar-footer">
          <span class="tiny-mark">◈</span>
          <p>YOUR SPACE.<br />YOUR PACE.</p>
        </div>
      </aside>
      <div class="topline">
        <span>{{
          auth.mode() === 'demo' ? 'FICTIONAL DEMO · THIS BROWSER ONLY' : 'PRIVATE WORKSPACE'
        }}</span>
        <div class="session-actions">
          <a routerLink="/me" aria-label="Your profile">A</a>
          <button type="button" data-testid="logout" [disabled]="loggingOut()" (click)="logout()">
            {{ loggingOut() ? 'Logging out…' : 'Log out' }}
          </button>
        </div>
      </div>
    }
    @if (logoutError()) {
      <p class="notice logout-error" role="alert">{{ logoutError() }}</p>
    }
    <main id="main" tabindex="-1" [class.with-shell]="auth.mode() !== 'none'">
      <router-outlet (activate)="routeActivated()" />
    </main>
    @if (auth.mode() !== 'none') {
      <nav class="bottom-nav" aria-label="Mobile navigation">
        @for (item of navigation; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active" ariaCurrentWhenActive="page"
            ><app-icon [name]="item.icon" /><span>{{ item.label }}</span></a
          >
        }
      </nav>
    }
    @if (store.message()) {
      <div class="toast" role="status">
        {{ store.message()
        }}<button aria-label="Dismiss status" (click)="store.message.set('')">×</button>
      </div>
    }
  `,
})
export class App {
  readonly auth = inject(Auth);
  readonly store = inject(Store);
  readonly router = inject(Router);
  readonly loggingOut = signal(false);
  readonly logoutError = signal('');
  readonly navigation = [
    { path: '/today', label: 'Today', icon: 'today' },
    { path: '/money', label: 'Money', icon: 'money' },
    { path: '/projects', label: 'Projects', icon: 'projects' },
    { path: '/goals', label: 'Goals', icon: 'goals' },
    { path: '/me', label: 'Me', icon: 'me' },
  ];
  constructor() {
    window.addEventListener('online', () => void this.store.retry());
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        document.title =
          'MyCompass · ' +
          (this.navigation.find((n) => event.urlAfterRedirects.startsWith(n.path))?.label ||
            'Your space');
      }
    });
  }
  async logout() {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    this.logoutError.set('');
    try {
      await this.auth.signOut();
      this.store.clear();
      await this.router.navigateByUrl('/auth', { replaceUrl: true });
    } catch (error) {
      this.logoutError.set(
        error instanceof Error ? error.message : 'Unable to log out. Please retry.',
      );
    } finally {
      this.loggingOut.set(false);
    }
  }
  routeActivated() {
    setTimeout(() => document.getElementById('main')?.focus(), 0);
  }
}
