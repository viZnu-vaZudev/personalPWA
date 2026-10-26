import { inject, Injectable, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DemoRepository, SupabaseRepository } from './repository';
import { config } from './config';
import { DEMO_USER } from './models';
@Injectable({ providedIn: 'root' })
export class Auth {
  private live = inject(SupabaseRepository);
  private demoRepo = inject(DemoRepository);
  readonly mode = signal<'none' | 'demo' | 'live'>('none');
  readonly userId = signal('');
  readonly configured = !!this.live.client;
  readonly demoAllowed = config.allowDemo;
  readonly ready = this.restore();
  private async restore() {
    if (this.live.client) {
      const { data } = await this.live.client.auth.getSession();
      if (data.session) {
        sessionStorage.removeItem('mycompass.demo');
        this.mode.set('live');
        this.userId.set(data.session.user.id);
      }
      this.live.client.auth.onAuthStateChange((_event, session) => {
        if (session) {
          sessionStorage.removeItem('mycompass.demo');
          this.mode.set('live');
          this.userId.set(session.user.id);
        } else if (this.mode() === 'live') {
          this.mode.set('none');
          this.userId.set('');
        }
      });
    }
    if (
      this.mode() === 'none' &&
      config.allowDemo &&
      sessionStorage.getItem('mycompass.demo') === 'yes'
    )
      await this.enterDemo();
  }
  async enterDemo() {
    if (!config.allowDemo) throw new Error('Demo is disabled in this build.');
    await this.demoRepo.initialize();
    sessionStorage.setItem('mycompass.demo', 'yes');
    this.userId.set(DEMO_USER);
    this.mode.set('demo');
  }
  async signIn(email: string, password: string) {
    if (!this.live.client) throw new Error('Live sign-in is not configured.');
    const { data, error } = await this.live.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    sessionStorage.removeItem('mycompass.demo');
    this.mode.set('live');
    this.userId.set(data.user.id);
  }
  async reset(email: string) {
    if (!this.live.client) throw new Error('Live sign-in is not configured.');
    const { error } = await this.live.client.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + '/auth/new-password',
    });
    if (error) throw error;
  }
  async updatePassword(password: string) {
    if (!this.live.client) throw new Error('Live sign-in is not configured.');
    const { error } = await this.live.client.auth.updateUser({ password });
    if (error) throw error;
  }
  async signOut() {
    if (this.mode() === 'live') {
      const { error } = await this.live.client!.auth.signOut({ scope: 'local' });
      if (error) throw error;
    }
    sessionStorage.removeItem('mycompass.demo');
    this.mode.set('none');
    this.userId.set('');
  }
}
export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth),
    router = inject(Router);
  await auth.ready;
  return auth.mode() !== 'none' || router.createUrlTree(['/auth']);
};
