# Angular and Supabase integration

The Angular app now uses the MyCompass v1 backend in `C:\2026\PersonalAppDarkBoard`. Live reads and writes are implemented in `src/app/core/live-repository.ts`; `backend-adapter.ts` maps frontend display fields to verified database columns. The database migrations remain authoritative for validation and RLS. MyCompass (ycpjuteqefcdmnryzxtp, Mumbai) is now deployed and configured. The live database passed 237 transactional assertions; public Auth reachability and anonymous REST denial were checked. Authenticated HTTP/file tests were skipped at the user's request.

## Connect the confirmed project

The backend migrations are applied to MyCompass. For another environment, follow the backend's `docs/backend-setup.md`. Do not point this frontend at an older personal app's unrelated schema. Then configure public values from this Angular directory:

```powershell
$env:SUPABASE_URL = 'https://YOUR_CONFIRMED_PROJECT_REF.supabase.co'
$env:SUPABASE_PUBLISHABLE_KEY = 'YOUR_PUBLISHABLE_KEY'
npm.cmd run configure:backend
npm.cmd run build
npm.cmd start -- --port 4300
```

The script writes public `core/backend-config.ts`, imported by development and production config. It rejects server secret keys and legacy JWTs whose role is not anon. The script loads `.env.local`, then `.env`, without replacing existing process-environment values. User-supplied public settings are preserved in the gitignored `.env.local`. `.env.example` contains placeholders. There are no service-role or AI provider secrets in the application. Changing the configuration requires rebuilding, including an installed PWA's new app version.

Auth uses Supabase session restoration, email/password login, sign-out and recovery. Create/invite the intended account using Supabase Auth; no custom password table or public registration flow is introduced. Configure allowed redirect URLs for your exact origins, including `http://localhost:4300/auth/new-password` and `http://127.0.0.1:4300/auth/new-password` in development. Production requires the actual HTTPS origin. Keep anonymous Auth sign-ins disabled. The backend local config now uses port 4300 and includes explicit recovery URLs for ports 4300 and 4200. Failed live requests never switch to demo.

## Types and transport

`core/generated/database.types.ts` is an exact generated copy of the backend's `supabase/types/database.types.ts`, obtained from the validated database, not hand-edited interfaces. This makes the Angular project build independently of the sibling backend path. After applying backend changes and regenerating authoritative types:

```powershell
# From the backend workspace
./supabase/scripts/sync-angular-types.ps1 -AngularRoot C:\2026\PAUIDark
```

The generated types validate table names and every mapping column. The dynamic repository transport is deliberately isolated from the UI. Numeric input is sent as decimal strings supported by PostgREST; numeric responses are converted to decimal strings at the boundary. Each individual numeric(14,2) amount fits below the JavaScript safe-integer paise boundary; calculations use bigint paise, and no floating-point sums are used. Server timestamps, including fractional microseconds, are retained unchanged for concurrency predicates. Lists paginate in deterministic UUID order with 500-row requests and explicit owner filters; RLS remains the authorization boundary. Calendar instants are interpreted in the loaded profile timezone rather than the computer's timezone.

## Collection mapping

| UI collection                           | Database table / rule                                                                                                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tasks, interviews                       | tasks; interview preparation is ordinary goal-linked work shared with Today                                                                                           |
| projects                                | projects; technology entries are separate project_technologies rows                                                                                                   |
| transactions                            | transactions; description maps to note, destination maps to to_account_id, business association uses business_id                                                      |
| categories                              | transaction_categories; direction immutable after creation                                                                                                            |
| accounts, budgets                       | accounts and budgets; budgets require an expense category and explicit inclusive period                                                                               |
| savings, contributions                  | savings_goals and savings_contributions; allocations do not create spending                                                                                           |
| bills                                   | recurring_payments; schedules only, never automatic ledger entries                                                                                                    |
| loans, repayments                       | loans and loan_payments; explicit principal/interest/fee breakdown and existing expense transaction                                                                   |
| milestones                              | project_milestones or goal_milestones, based on the one selected parent; parent table cannot be switched during an edit                                               |
| repositories, hosting, technologies     | project_repositories, project_hostings, project_technologies                                                                                                          |
| dependencies, project_updates           | task_dependencies and project_updates; dependency cycles are rejected by PostgreSQL                                                                                   |
| goals, goal_projects, career_plans      | goals, goal_projects, career_plans; many-to-many goal/project links are separate records                                                                              |
| skills, learning, evidence              | career_skills and learning_logs; evidence is the subset of learning logs with an evidence_url                                                                         |
| businesses, ideas, prospects            | businesses and business_contacts; ideas are businesses at stage idea. Business records and business-type goals are independent; no automatic association is invented. |
| applications                            | job_applications, with separate company and role fields                                                                                                               |
| appointments, health_notes, medications | health_appointments, health_records, medications                                                                                                                      |
| attendance, exercises, workouts         | gym_sessions, exercises, workout_sets; choose a saved session and exercise for each numbered set                                                                      |
| reminders, reviews, profiles            | reminders, weekly_reviews, profiles; profile uses Auth id, reviews start on Monday                                                                                    |

Forms now expose the backend's required inputs and enum values instead of submitting provisional text fields. Optional foreign keys become null. Client-generated UUIDs support retries. Project cancellation is excluded from progress; estimates use remaining minutes and availability, and unresolved dependencies or blockers make their impact unknown. Account balances include opening balances and all recorded transactions, including future dates. Budget remaining is shown for one selected-period category budget; multiple budgets lead to the category detail view rather than adding overlapping budgets.

## Offline and optimistic concurrency

Only tasks and transactions are queued offline. Existing account-scoped IndexedDB retry handling is retained. Online failures remain visible. Conditional updates include id, owner and the complete original updated_at string; zero updated rows produce ConflictError. A repeated insert reads back the same UUID and compares the normalized payload, including numeric normalization; a different record is a conflict. No upsert silently overwrites edits. Health collections and files are excluded from offline snapshots and service-worker caching.

Multi-row loan corrections must be performed in one authorized backend transaction; separate REST requests cannot atomically alter both the expense amount and its repayment breakdown. The UI can edit one side only when the database invariants remain valid, and displays rejection otherwise. No service-role bypass is added.

## Private reports

Saved health records have an upload/preview panel. Files upload to `mycompass-private/<uid>/<attachment-uuid>/<sanitized-name>` with a 20 MiB limit, then create an owned attachments row. A rejected metadata insert attempts immediate object cleanup; cleanup failure is reported for reconciliation. Previews use 60-second signed URLs, held only in component memory. Metadata is not proof that the object exists. No file bytes or preview URLs are placed into the outbox, service-worker cache or persistent records. Unreferenced uploads still require the backend's documented grace-period cleanup process. This integration provides upload/preview; deletion remains a future explicit UI action.

## Validation and remaining checks

Production compilation and all 28 automated tests passed on 26 October 2026. The automated suite includes the existing money/forms/routes/IndexedDB checks plus new adapter tests and real supabase-js requests against a controlled mocked HTTP transport. It covers verified column payloads, decimals, profile identity, timezone/DST handling, pagination, microsecond concurrency, duplicate retries, milestone table separation and cleanup after upload metadata failure. These mocked transport tests are complemented by 237 SQL assertions against the deployed database, including two-user RLS checks with rolled-back fixtures. No real Auth sign-in or Storage HTTP test is claimed.

The public settings now connect to https://ycpjuteqefcdmnryzxtp.supabase.co; anonymous projects access returned HTTP 401, and security advisors returned no findings. At the user's request no temporary Auth users were created. For release acceptance using real test accounts, check: login/recovery, owner CRUD, cross-user reads and parent links, transfer balances, loan rejection, task/milestone consistency, dependency cycles, private file upload/upsert/preview denial, offline retry and stale edits. Recheck browser keyboard navigation and responsive layout, PWA install/update and offline shell behavior. No paid AI provider, push dispatcher or automatic cleanup scheduler is connected.

## Login and logout verification

The user explicitly requested a retained Alex test account. alex@mycompass.test was created through Supabase Auth, confirmed for immediate password sign-in, and given an Alex profile. Its randomly generated password is not stored in source, migrations, documentation, or environment files; it was supplied directly to the user. This reserved test email cannot receive recovery messages.

The shared header now has a visible Log out button on desktop and mobile. It disables during the request, reports failures, clears loaded private view state after successful logout, and returns to /auth. Supabase logout explicitly uses scope local, ending the current session. Account-scoped offline outbox data remains on the device for later reconciliation; it is not displayed to another account.

Verified with real Supabase HTTP calls: Alex email/password login, authenticated profile read, task insert and conditional update, private file upload/download/signed preview, anonymous private-file denial, and logout followed by rejected refresh-token reuse. The test task and file were removed; the requested Alex account remains. Production build and all 31 Angular tests passed, including header logout success/error and local-scope session cleanup. Cross-user RLS continues to be covered by the 237 transactional database assertions; this check did not create a second live user.

Passwords are checked by Supabase Auth and stored as hashes, not in application tables. On successful login, supabase-js retains the access/refresh session in browser storage and refreshes it when appropriate. Route guards wait for session restoration, and PostgreSQL RLS authorizes each owner's records. Logout removes the browser's Auth session and revokes its refresh session; already-issued access JWTs expire according to the project's token lifetime.
