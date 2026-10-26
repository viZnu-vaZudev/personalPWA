# MyCompass frontend

Angular 22.2 standalone application with strict TypeScript, lazy feature routes, reactive forms, and a deliberately monochrome mobile/desktop layout. Design reference: Stitch project `10994832112276440094` (MyCompass Personal Assistant). This checkout contains the Angular integration for the MyCompass Supabase backend.

## Run locally

Requires Node 22.22.3+ (the project installs a local Node 22 runtime for this machine's older system Node).

```powershell
npm.cmd ci
npm.cmd start -- --port 4300
```

`npm` scripts use the local Node executable from `node_modules/.bin`. If invoking the CLI directly on this machine:

```powershell
.\node_modules\node\bin\node.exe node_modules/@angular/cli/bin/ng.js serve --port 4300
.\node_modules\node\bin\node.exe node_modules/@angular/cli/bin/ng.js test --watch=false
.\node_modules\node\bin\node.exe node_modules/@angular/cli/bin/ng.js build
```

Choose **Explore fictional demo** on the sign-in screen. Demo mode is never selected automatically after a live error. Fictional records persist in this browser's `mycompass.demo.v1` localStorage entry, while the demo session marker lasts for the browser session. Sign out ends the demo session; clearing that storage entry resets fictional records.

## Builds

- `npm.cmd run build`: production, demo disabled, fictional fixtures replaced by an empty module.
- `npm.cmd run build -- --configuration demo`: explicitly demo-enabled optimized build, with fictional fixtures and the production service worker. Use this for an installable demo preview.
- Build output: `dist/mycompass/browser`. Static hosting must rewrite application routes to `index.html`; serve over HTTPS except localhost.
- `npm.cmd test`: 28 meaningful tests for money, form validation, route ordering/guards, demo identity, optimistic conflicts and IndexedDB retries/account isolation.

Fonts and icons are bundled locally. The manifest includes 192px/512px PNG icons and an SVG maskable icon. Angular's service worker caches only application files and font assets; it has no API data groups. No private medical files or authenticated Supabase responses are cached by the service worker.

## Data boundaries

`core/models.ts` contains frontend display interfaces using snake_case, UUIDs, date-only strings and ISO instants. Money stays as decimal strings at the boundary and bigint paise for calculation and formatting. No floating-point financial totals are used. Transfers are excluded from income/expense totals; savings allocations, recurring schedules and repayment breakdowns are separate collections. Account balances include actual transfers. Budgets use explicit category periods; overlapping limits are never combined into an overall total.

`Repository` separates UI from persistence. `DemoRepository` is browser-local and explicitly fictional. `SupabaseRepository` uses a frontend publishable key and authenticated Supabase sessions. Explicit adapters map every collection to the verified database contract, including normalized relations and private health uploads. The live MyCompass project is deployed and configured. Public Auth connectivity, anonymous private-record denial and 237 transactional database assertions passed; authenticated sign-in and file HTTP tests were skipped at the user's request.

Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, then run `npm.cmd run configure:backend` to configure the confirmed project in the shared `core/backend-config.ts`. These values are public browser configuration. Never put a service-role key, provider secret, repository token or hosting password in the client. Production demo data is excluded using Angular file replacements.

## Structure

- `core/`: auth/session guard, configuration, repositories, decimal money, store and IndexedDB outbox.
- `features/overview.ts`: small overview and supporting menu/report pages.
- `features/records.ts` and `schema.ts`: metadata-driven reactive create/edit/detail flows, avoiding duplicate feature forms.
- `features/planner.ts`, `auth-page.ts`, `assistant.ts`: dedicated planner, auth and provider-boundary flows.
- `shared/`: accessible fields, status/list/header/empty/error/loading controls, Lucide SVGs, native modal confirmation (a bottom sheet on mobile).
- `app.routes.ts`: all route definitions; supporting paths precede entity IDs.

## Offline behavior

Only tasks and transactions can be captured offline in live mode. An explicit account-scoped IndexedDB snapshot of tasks, transactions, accounts and categories supports editing and lookup choices after reload; health collections are excluded. Online failures are never silently served cached data. They use client UUIDs and a user-scoped IndexedDB outbox, with pending/synced/failed/conflict states in Settings > Offline & sync. Repeat offline edits preserve the original server version. Retrying keeps the same UUID. Insert retries treat an existing identical record as success and treat a different record as a conflict. Updates compare `updated_at` and stop on stale data instead of overwriting it. Conflicts require reviewing and reapplying changes; automatic retries stop. The outbox checks account identity before each request. Other live forms require a connection.

Demo persistence is separate and does not exercise the live transport. Tests exercise the actual IndexedDB queue using fake-indexeddb. The backend must provide reliable server versions and ownership enforcement before live synchronization is enabled.

## Validation status

The initial frontend production build and 15 automated tests passed during implementation; dependency audit reported zero vulnerabilities after overriding Vite to a patched version. The local preview returned HTTP 200. Browser tools reported no connected browsers, so visual screenshots, real keyboard navigation, 320px browser rendering, installation and offline service-worker behavior still need manual browser QA. Responsive CSS includes a 320px breakpoint, wrapping, safe-area navigation, visible focus and reduced-motion support; these are implemented, not claimed as browser-verified.

See `docs/frontend-integration.md` for the completed contract mapping, public configuration, generated-type ownership, and required live acceptance checks.

The integration adds 13 adapter/HTTP transport tests (28 total). These use a mocked HTTP boundary and do not claim live Supabase validation. The backend is deployed to MyCompass (ycpjuteqefcdmnryzxtp). The current production build and all 28 tests passed after configuration. Use an actual Supabase Auth account to sign in; owner onboarding and production Auth redirect settings remain release checks.
