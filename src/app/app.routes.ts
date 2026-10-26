import { Routes } from '@angular/router';
import { authGuard } from './core/auth';
import { EntityKind } from './core/models';
const records = () => import('./features/records').then((m) => m.RecordsPage);
const overview = () => import('./features/overview').then((m) => m.OverviewPage);
function collection(path: string, kind: EntityKind): Routes {
  return [
    {
      path: path + '/new',
      loadComponent: records,
      data: { kind, base: '/' + path, editing: true },
      canActivate: [authGuard],
    },
    {
      path: path + '/:id/edit',
      loadComponent: records,
      data: { kind, base: '/' + path, editing: true },
      canActivate: [authGuard],
    },
    {
      path: path + '/:id',
      loadComponent: records,
      data: { kind, base: '/' + path },
      canActivate: [authGuard],
    },
    { path, loadComponent: records, data: { kind, base: '/' + path }, canActivate: [authGuard] },
  ];
}
export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  ...['signin', 'reset', 'new-password', 'verify'].map((mode) => ({
    path: mode === 'signin' ? 'auth' : 'auth/' + mode,
    loadComponent: () => import('./features/auth-page').then((m) => m.AuthPage),
    data: { mode },
  })),
  {
    path: 'today/planner',
    loadComponent: () => import('./features/planner').then((m) => m.PlannerPage),
    canActivate: [authGuard],
  },
  {
    path: 'assistant',
    loadComponent: () => import('./features/assistant').then((m) => m.AssistantPage),
    canActivate: [authGuard],
  },
  ...['today', 'money', 'me'].map((page) => ({
    path: page,
    loadComponent: overview,
    data: { page },
    canActivate: [authGuard],
  })),
  ...['health', 'gym', 'review', 'settings', 'install', 'notifications', 'sync'].map((page) => ({
    path: 'me/' + page,
    loadComponent: overview,
    data: { page },
    canActivate: [authGuard],
  })),
  {
    path: 'money/reports',
    loadComponent: overview,
    data: { page: 'reports' },
    canActivate: [authGuard],
  },
  {
    path: 'projects/updates',
    loadComponent: overview,
    data: { page: 'updates' },
    canActivate: [authGuard],
  },
  {
    path: 'projects/:id/estimates',
    loadComponent: overview,
    data: { page: 'estimates' },
    canActivate: [authGuard],
  },
  ...collection('today/tasks', 'tasks'),
  ...collection('today/reminders', 'reminders'),
  ...(
    [
      'transactions',
      'accounts',
      'categories',
      'budgets',
      'savings',
      'contributions',
      'bills',
      'loans',
      'repayments',
    ] as EntityKind[]
  ).flatMap((kind) => collection('money/' + kind, kind)),
  ...(
    [
      'tasks',
      'milestones',
      'repositories',
      'hosting',
      'technologies',
      'dependencies',
      'project_updates',
    ] as EntityKind[]
  ).flatMap((kind) => collection('projects/' + kind, kind)),
  ...(
    [
      'tasks',
      'milestones',
      'career_plans',
      'businesses',
      'goal_projects',
      'skills',
      'learning',
      'evidence',
      'interviews',
      'applications',
      'prospects',
      'ideas',
    ] as EntityKind[]
  ).flatMap((kind) => collection('goals/' + kind, kind)),
  ...(
    [
      'appointments',
      'health_notes',
      'medications',
      'attendance',
      'workouts',
      'exercises',
      'reviews',
      'profiles',
    ] as EntityKind[]
  ).flatMap((kind) => collection('me/' + kind, kind)),
  ...collection('projects', 'projects'),
  ...collection('goals', 'goals'),
  { path: '**', redirectTo: 'today' },
];
