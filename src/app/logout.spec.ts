import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { Auth } from './core/auth';
import { Store } from './core/store';
import { SupabaseRepository, DemoRepository } from './core/repository';

describe('Header logout', () => {
  let auth: any, store: any;
  beforeEach(() => {
    auth = {
      mode: signal('live'),
      signOut: vi.fn(async () => {
        auth.mode.set('none');
      }),
    };
    store = { message: signal(''), clear: vi.fn(), retry: vi.fn() };
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([{ path: 'auth', component: class {} }]),
        { provide: Auth, useValue: auth },
        { provide: Store, useValue: store },
      ],
    });
  });
  it('logs out, clears private view state, and returns to sign-in', async () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      '[data-testid="logout"]',
    ) as HTMLButtonElement;
    expect(button.textContent).toContain('Log out');
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(auth.signOut).toHaveBeenCalledTimes(1);
    expect(store.clear).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth', { replaceUrl: true });
    expect(fixture.nativeElement.querySelector('[data-testid="logout"]')).toBeNull();
  });
  it('shows a retryable error if Supabase logout fails', async () => {
    auth.signOut.mockRejectedValue(new Error('Connection lost'));
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="logout"]').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Connection lost',
    );
    expect(store.clear).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-testid="logout"]').disabled).toBe(false);
  });
});
describe('Supabase logout scope', () => {
  it('ends the current session and clears live identity and demo markers', async () => {
    const signOut = vi.fn(async () => ({ error: null }));
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SupabaseRepository,
          useValue: {
            client: {
              auth: {
                getSession: async () => ({ data: { session: null } }),
                onAuthStateChange: vi.fn(),
                signOut,
              },
            },
          },
        },
        { provide: DemoRepository, useValue: { initialize: vi.fn() } },
      ],
    });
    const auth = TestBed.inject(Auth);
    await auth.ready;
    auth.mode.set('live');
    auth.userId.set('alex');
    sessionStorage.setItem('mycompass.demo', 'yes');
    await auth.signOut();
    expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(auth.mode()).toBe('none');
    expect(auth.userId()).toBe('');
    expect(sessionStorage.getItem('mycompass.demo')).toBeNull();
  });
});
