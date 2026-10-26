import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../core/auth';
import { PageHeader } from '../shared/ui';
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeader],
  template: `<div class="auth-layout">
    <p class="wordmark">◈ MyCompass</p>
    <app-header [title]="title" subtitle="A quieter place for everything that matters." />
    <p>
      {{
        auth.configured
          ? 'Sign in to your private space.'
          : 'Live sign-in is not configured yet. You can explicitly explore the fictional demo.'
      }}
    </p>
    @if (mode === 'verify') {
      <p>Check your email for a verification link. After verification, return here to sign in.</p>
      <a routerLink="/auth">Back to sign in</a>
    } @else {
      <form [formGroup]="form" (ngSubmit)="submit()">
        @if (mode !== 'new-password') {
          <label for="email">Email</label
          ><input id="email" formControlName="email" type="email" autocomplete="email" />
        }
        @if (mode !== 'reset') {
          <label for="password">Password</label
          ><input
            id="password"
            formControlName="password"
            type="password"
            [autocomplete]="mode === 'new-password' ? 'new-password' : 'current-password'"
          />
        }
        <button class="primary" [disabled]="!auth.configured || busy()">
          {{
            mode === 'reset'
              ? 'Send reset link'
              : mode === 'new-password'
                ? 'Set new password'
                : 'Sign in'
          }}
        </button>
        @if (error()) {
          <p role="alert">{{ error() }}</p>
        }
        @if (message()) {
          <p role="status">{{ message() }}</p>
        }
      </form>
      <a routerLink="/auth/reset">Forgot password?</a>
    }
    <!-- @if (auth.demoAllowed) {
      <section>
        <button (click)="demo()">Explore fictional demo ↗</button>
        <p class="hint">Demo data is stored in this browser. No live account is used.</p>
      </section>
    } -->
  </div>`,
})
export class AuthPage {
  readonly auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly mode = this.route.snapshot.data['mode'] || 'signin';
  readonly title =
    this.mode === 'reset'
      ? 'Reset password'
      : this.mode === 'new-password'
        ? 'A fresh start'
        : this.mode === 'verify'
          ? 'Check your email'
          : 'Find your direction.';
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });
  readonly error = signal('');
  readonly message = signal('');
  readonly busy = signal(false);
  constructor() {
    if (this.mode === 'signin') {
      this.form.controls.password.setValidators([Validators.required]);
      this.form.controls.password.updateValueAndValidity();
    }
    if (this.mode === 'reset') this.form.controls.password.disable();
    if (this.mode === 'new-password') this.form.controls.email.disable();
  }
  async demo() {
    try {
      await this.auth.enterDemo();
      await this.router.navigate(['/today']);
    } catch (e) {
      this.error.set(String(e));
    }
  }
  async submit() {
    if (this.form.invalid) {
      this.error.set(
        this.mode === 'new-password'
          ? 'Enter a new password of at least eight characters.'
          : 'Enter a valid email and your password where required.',
      );
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      const { email, password } = this.form.getRawValue();
      if (this.mode === 'reset') {
        await this.auth.reset(email);
        this.message.set(
          'If an account exists, a reset link has been requested. Check your email.',
        );
      } else if (this.mode === 'new-password') {
        await this.auth.updatePassword(password);
        this.message.set('Password updated.');
        await this.router.navigate(['/today']);
      } else {
        await this.auth.signIn(email, password);
        await this.router.navigate(['/today']);
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Authentication failed.');
    } finally {
      this.busy.set(false);
    }
  }
}
