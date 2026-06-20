Default Sport Filter# Pulse Arena Project Audit Report

Date: 2026-06-20  
Workspace: `c:\Users\Louay\Documents\SportsStreaming`

## Scope

Inspected the tracked application source/config files, untracked root artifacts, generated build/dev logs, dependency manifests, and installed dependency metadata. Vendored `node_modules` and generated `.next` output were audited through `npm audit`, `npm ls`, `npm outdated`, `depcheck`, production build output, and dev logs rather than line-by-line source review.

Commands run:

- `npm run lint`: failed.
- `npm run typecheck`: passed.
- `npm run build`: passed with Sentry setup warnings.
- `npm audit --json`: 2 moderate vulnerabilities.
- `npm ls --depth=0`: 1 extraneous package.
- `npm outdated --json`: several newer majors available.
- `npx depcheck --json`: unused/missing dependency findings.
- Local production smoke test on port `3100`: `/`, `/settings`, `/schedule`, `/api/streamed/sports` returned 200; `/api/stats` correctly returned 400 without required params.

## Phase 1: Project Map

Architecture:

- Next.js 15 App Router app with React 19 client-heavy UI.
- Global shell: `app/layout.tsx` wraps every route in `Providers` and `AppShell`.
- Data sources: Streamed public API via `lib/streamed/client.ts` and `/api/streamed/[...path]`; ESPN soccer API via `/api/stats`; Sentry; Google/Outlook calendar links.
- State/storage: TanStack Query persisted to IndexedDB for 24h; Zustand persisted to localStorage for favorites, preferences, and reminders.
- No database layer, no auth layer, no CI/CD config, no test framework, no deployment config found.

Route/API map:

- `app/page.tsx`: home dashboard.
- `app/live/page.tsx`: live match dashboard.
- `app/schedule/page.tsx`: dynamic schedule shell.
- `app/sports/page.tsx`: sports directory.
- `app/sports/[sport]/page.tsx`: sport detail route.
- `app/match/[id]/page.tsx`: match center route.
- `app/watch/[source]/[id]/page.tsx`: embedded stream route.
- `app/search/page.tsx`, `app/favorites/page.tsx`, `app/settings/page.tsx`: system screens.
- `app/api/streamed/[...path]/route.ts`: public Streamed JSON proxy.
- `app/api/stats/route.ts`: ESPN soccer telemetry enrichment endpoint.

Source purpose inventory:

- `components/app/*`: Query persistence provider and in-app reminder toast engine.
- `components/layout/*`: global nav, mobile nav, ticker, footer, app shell.
- `components/home/*`: home/live dashboards and featured hero.
- `components/match/*`: cards, match center panels, telemetry panels, favorite/reminder controls.
- `components/stream/*`: stream player and stream telemetry sidebar/panel.
- `components/schedule/*`: schedule hero, filters, timeline, date nav, quick jump, cards.
- `components/system/*`: search, favorites, settings, sports directory/detail, errors/degraded mode.
- `components/ui/*`: button, badge, input, glass panel, skeleton, section header, error boundary.
- `hooks/*`: TanStack Query hooks and schedule filter/grouping hooks.
- `lib/streamed/*`: API client, selectors, schedule/date/calendar helpers, shared types.
- `store/*`: persisted Zustand stores.
- `sentry.*.config.ts`: Sentry client/server/edge setup.
- `check_html.js`, `extract.js`, `test_filter.js`: untracked scratch scripts.
- `out*.json`, `schedule.html`, `next_data.txt`: untracked captured/generated data.

## Issues

### Issue 1

### Issue

Third-party stream iframe is unsandboxed.

### Severity

High

### Location

`components/stream/stream-view.tsx`, `StreamView`

### Evidence

```tsx
<iframe
  src={activeStream.embedUrl}
  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
  referrerPolicy="no-referrer"
/>
```

There is no `sandbox`, host validation, or page-level CSP limiting `frame-src`.

### Impact

Untrusted stream embeds can execute scripts, open popups/top navigation flows depending on browser behavior, fingerprint users, and expose the app to malicious embed behavior.

### Recommended Fix

Validate `new URL(activeStream.embedUrl)` against an explicit allowlist, add a restrictive iframe `sandbox`, add `allowFullScreen`, and set a CSP `frame-src` allowlist in `next.config.ts` headers.

### Confidence

High

### Issue 2

### Issue

Match telemetry is hard-coded to ESPN soccer for every sport.

### Severity

High

### Location

`app/api/stats/route.ts`, `LiveScoreboard`, `MatchAnalyticsTabs`, `StreamTelemetrySidebar`

### Evidence

```ts
const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?_=${t}`;
```

Every match center calls `/api/stats?home=...&away=...` without passing sport/category.

### Impact

Basketball, baseball, fight, tennis, motor-sports, and other events receive wrong or empty soccer telemetry, undermining a core product surface.

### Recommended Fix

Pass `match.category` into telemetry, route by supported provider/sport, and return `204`/typed unsupported state for unsupported sports instead of pretending telemetry exists.

### Confidence

High

### Issue 3

### Issue

Telemetry event matching can select the wrong ESPN event.

### Severity

High

### Location

`app/api/stats/route.ts`, lines 26-40

### Evidence

```ts
if (eventName.includes(normalizedHome) || eventName.includes(normalizedAway)) {
  targetEvent = event;
  break;
}
```

Only one team substring is enough to match.

### Impact

Generic names such as "United", "City", "Tigers", or shared club names can bind one match page to another live event and show incorrect scores/standings.

### Recommended Fix

Normalize both sides, require both teams or a strong alias match, constrain by date/league, and expose a confidence score. Return no telemetry below threshold.

### Confidence

High

### Issue 4

### Issue

Lint currently fails.

### Severity

High

### Location

`package.json`, `check_html.js`, `extract.js`, `test_filter.js`

### Evidence

`npm run lint` reports `@typescript-eslint/no-require-imports` errors for all three root scratch scripts.

### Impact

CI would fail immediately if lint is required, and production readiness gates cannot rely on a clean static-analysis baseline.

### Recommended Fix

Delete/move scratch scripts, convert them to ESM, or ignore a dedicated `scripts/`/`scratch/` directory intentionally.

### Confidence

High

### Issue 5

### Issue

No real automated tests are configured.

### Severity

High

### Location

`package.json`, repository test inventory

### Evidence

`npm run` exposes only `dev`, `build`, `start`, `lint`, and `typecheck`; `rg '*test*'` finds only `test_filter.js`, a scratch script.

### Impact

Core flows, API contracts, local persistence, schedule filtering, telemetry matching, and stream security regressions have no automated protection.

### Recommended Fix

Add unit tests for `lib/streamed/*`, integration tests for both API routes with mocked upstreams, and Playwright E2E for home/search/schedule/match/watch flows.

### Confidence

High

### Issue 6

### Issue

No explicit security headers or CSP are configured.

### Severity

Medium

### Location

`next.config.ts`

### Evidence

The config only defines `images`, `experimental`, and Sentry wrapping. There is no `headers()` function.

### Impact

XSS blast radius, iframe behavior, referrer behavior, and permissions policy are governed mostly by browser defaults.

### Recommended Fix

Add CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `frame-ancestors`. Include explicit `connect-src`, `img-src`, and `frame-src` for Streamed/ESPN/Sentry.

### Confidence

High

### Issue 7

### Issue

Telemetry failures are returned as successful empty data.

### Severity

Medium

### Location

`app/api/stats/route.ts`, lines 254-267

### Evidence

```ts
return Response.json(emptyData, {
  headers: { "cache-control": "public, s-maxage=5, stale-while-revalidate=10" },
});
```

The catch block omits an error status.

### Impact

Clients cannot distinguish "no stats yet" from ESPN/network failure, causing silent data corruption and bad caching.

### Recommended Fix

Return `502`/`503` with a typed error payload, or include `{ status: "unavailable", reason }` and avoid caching failures as normal data.

### Confidence

High

### Issue 8

### Issue

Public APIs lack input validation and rate limiting.

### Severity

Medium

### Location

`app/api/stats/route.ts`, `app/api/streamed/[...path]/route.ts`

### Evidence

`home`, `away`, and catch-all `path` are accepted without length/character limits or per-client throttling.

### Impact

Attackers can use the app as a polling amplifier against upstream services and can force expensive server work with very long query strings.

### Recommended Fix

Validate parameter length and charset, cap path depth, use cache keys intentionally, and add platform middleware/rate limiting for both routes.

### Confidence

Medium

### Issue 9

### Issue

Upstream fetches have no timeout or abort strategy.

### Severity

Medium

### Location

`lib/streamed/client.ts`, `app/api/streamed/[...path]/route.ts`, `app/api/stats/route.ts`

### Evidence

Each route/client calls `fetch(...)` without an `AbortSignal.timeout(...)`.

### Impact

Slow upstreams can hold requests open, delay SSR, consume serverless duration, and make navigation feel hung.

### Recommended Fix

Wrap fetches with `AbortSignal.timeout(5000-10000)`, classify timeout errors, and use retries only where idempotent and bounded.

### Confidence

High

### Issue 10

### Issue

External API responses are trusted without runtime validation.

### Severity

Medium

### Location

`lib/streamed/client.ts`, `app/api/stats/route.ts`

### Evidence

```ts
return (await response.json()) as T;
```

The code casts unknown JSON directly into application types.

### Impact

Missing `sources`, malformed dates, or shape changes can crash pages, break sorting, or persist corrupted data.

### Recommended Fix

Add runtime schemas for Streamed sports/matches/streams and ESPN telemetry. Reject or normalize invalid rows before they reach UI state.

### Confidence

High

### Issue 11

### Issue

Query persistence stores all query data for 24 hours.

### Severity

Medium

### Location

`components/app/providers.tsx`

### Evidence

```ts
gcTime: 1000 * 60 * 60 * 24
persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
```

### Impact

Stream URLs, telemetry, and match data can remain stale or sensitive in IndexedDB long after they expire upstream.

### Recommended Fix

Use `dehydrateOptions.shouldDehydrateQuery` to persist only low-risk lists, exclude stream/embed and telemetry queries, and use shorter TTLs.

### Confidence

High

### Issue 12

### Issue

Search command is mounted twice and registers duplicate global shortcuts.

### Severity

Medium

### Location

`components/layout/top-navigation.tsx`, `components/system/search-command.tsx`

### Evidence

`TopNavigation` renders two `<SearchCommand>` instances, and each instance adds a `window.addEventListener("keydown", ...)`.

### Impact

Pressing `/` or `Ctrl/Cmd+K` can open two dialogs. On the watch route, the stream view also handles `/`, causing route/modal races.

### Recommended Fix

Move search modal state and keyboard listener to one global provider, or render one SearchCommand and style triggers responsively.

### Confidence

High

### Issue 13

### Issue

Reduced-motion preference is not applied to app animations.

### Severity

Medium

### Location

`store/preferences-store.ts`, `components/system/settings-view.tsx`, `components/layout/live-ticker.tsx`, Framer Motion components

### Evidence

`reducedMotion` is stored and toggled, but no animation component reads it. `LiveTicker` uses `requestAnimationFrame` and says it runs across all reduced-motion settings.

### Impact

The setting is misleading and accessibility-sensitive users still receive marquee and Framer Motion animations.

### Recommended Fix

Read `reducedMotion` in `AppShell`, `Reveal`, `FeaturedMatchHero`, `ScheduleCard`, and `LiveTicker`; disable RAF/motion transitions when enabled.

### Confidence

High

### Issue 14

### Issue

Default sport preference is stored but unused.

### Severity

Medium

### Location

`store/preferences-store.ts`, `components/system/settings-view.tsx`

### Evidence

`selectedSport` is set in settings but no other component reads it.

### Impact

The settings panel promises behavior that never happens.

### Recommended Fix

Apply `selectedSport` in `SportsDirectory`, `ScheduleView`, or remove the setting until implemented.

### Confidence

High

### Issue 15

### Issue

Dynamic route links do not consistently encode path parameters.

### Severity

Medium

### Location

Multiple files including `match-card.tsx`, `match-detail-view.tsx`, `featured-match-hero.tsx`, `schedule-card.tsx`, `sports-directory.tsx`

### Evidence

```tsx
href={`/watch/${firstSource.source}/${encodeURIComponent(firstSource.id)}`}
href={`/match/${match.id}`}
href={`/sports/${sport.id}`}
```

`source`, `match.id`, and `sport.id` are external data and are not always encoded.

### Impact

Unexpected `/`, `?`, `#`, or encoded separators in upstream IDs can break routing or send users to the wrong route.

### Recommended Fix

Wrap every dynamic path segment with `encodeURIComponent`, and centralize route builders.

### Confidence

Medium

### Issue 16

### Issue

ICS calendar export does not escape iCalendar fields.

### Severity

Medium

### Location

`lib/streamed/schedule.ts`, `generateICSDownloadUrl`

### Evidence

```ts
`UID:match-${match.id}@pulsearena`,
`SUMMARY:Pulse Arena: ${match.title}`,
`DESCRIPTION:Watch live on Pulse Arena. Category: ${match.category}`,
```

### Impact

Titles/categories containing CRLF, semicolons, commas, or backslashes can corrupt the `.ics` file or inject additional calendar properties.

### Recommended Fix

Implement RFC 5545 text escaping and line folding. Strip CR/LF from UID or hash the match ID.

### Confidence

High

### Issue 17

### Issue

Sentry App Router setup is incomplete and noisy.

### Severity

Medium

### Location

`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `next.config.ts`

### Evidence

Production build warns that instrumentation and global error handler files are missing. Client config sets `debug: true` and `tracesSampleRate: 1`.

### Impact

Server/edge/rendering errors may not be captured reliably, while client telemetry can be overly noisy and expensive.

### Recommended Fix

Add `instrumentation.ts`, `instrumentation-client.ts`, and `app/global-error.tsx`; set production sampling and disable client debug logs.

### Confidence

High

### Issue 18

### Issue

User-facing error page exposes raw error messages.

### Severity

Medium

### Location

`app/error.tsx`

### Evidence

```tsx
{
  error.message && <pre> {error.message} </pre>;
}
```

### Impact

Server/client errors can reveal internal implementation details to users.

### Recommended Fix

Show a generic message and correlation/digest ID; send full details to Sentry only.

### Confidence

High

### Issue 19

### Issue

Dependency audit reports moderate vulnerabilities through Next's bundled PostCSS.

### Severity

Medium

### Location

`package-lock.json`, `node_modules/next/node_modules/postcss`

### Evidence

`npm audit --json` reports GHSA-qx2v-qp2m-jg93 for PostCSS `<8.5.10`; installed Next bundles `postcss@8.4.31`.

### Impact

If untrusted CSS is stringified through the vulnerable path, XSS is possible.

### Recommended Fix

Track/update to a Next release that bumps bundled PostCSS, or use an officially supported override/patch once available. Do not follow npm audit's bad downgrade suggestion blindly.

### Confidence

Medium

### Issue 20

### Issue

ESLint config imports an undeclared package directly.

### Severity

Medium

### Location

`eslint.config.mjs`, `package.json`

### Evidence

```js
import { FlatCompat } from "@eslint/eslintrc";
```

`@eslint/eslintrc` is not declared in `devDependencies`; depcheck reports it missing.

### Impact

Clean installs can break if the transitive dependency layout changes.

### Recommended Fix

Add `@eslint/eslintrc` as a devDependency or rewrite the config to avoid the direct import.

### Confidence

High

### Issue 21

### Issue

`cheerio` is declared but unused.

### Severity

Medium

### Location

`package.json`

### Evidence

`depcheck` reports `"dependencies":["cheerio"]`, and source search finds no import.

### Impact

Adds install time, attack surface, and transitive dependencies including `undici`.

### Recommended Fix

Remove `cheerio` unless a planned feature uses it.

### Confidence

High

### Issue 22

### Issue

Large button height uses a nonexistent Tailwind utility.

### Severity

Medium

### Location

`components/ui/button.tsx`

### Evidence

```ts
lg: "h-13 px-6 text-base";
```

`rg h-13 .next/static/*.css` found no generated CSS.

### Impact

Large buttons can lose their intended fixed height after class merging, creating inconsistent layouts.

### Recommended Fix

Use `h-12`, `h-14`, or `h-[3.25rem]`.

### Confidence

High

### Issue 23

### Issue

Metadata base is hard-coded to a local domain.

### Severity

Low

### Location

`app/layout.tsx`

### Evidence

```ts
metadataBase: new URL("https://pulse-arena.local");
```

### Impact

Canonical/OpenGraph metadata can be wrong in staging/production.

### Recommended Fix

Use `process.env.NEXT_PUBLIC_SITE_URL` with a production fallback.

### Confidence

High

### Issue 24

### Issue

Live/recent status logic assumes all sports last 135 minutes.

### Severity

Medium

### Location

`lib/streamed/selectors.ts`, `getMatchStatus`

### Evidence

```ts
const LIVE_WINDOW_MS = 135 * 60 * 1000;
```

### Impact

Baseball, cricket, golf, motorsports, fights, and long tournaments are misclassified.

### Recommended Fix

Use sport-specific durations or upstream status when available.

### Confidence

High

### Issue 25

### Issue

Sports directory counts every past event as live-ish.

### Severity

Medium

### Location

`components/system/sports-directory.tsx`

### Evidence

```ts
const liveCount = sportMatches.filter(
  (match) => match.date <= Date.now(),
).length;
```

### Impact

Ended matches and `date: 0` channel rows inflate "signals are in or near the live window."

### Recommended Fix

Use `getMatchStatus(match) === "live" || "recent"` with bounded windows.

### Confidence

High

### Issue 26

### Issue

Global shell fetches match data on every page.

### Severity

Medium

### Location

`components/layout/app-shell.tsx`, `components/layout/live-ticker.tsx`

### Evidence

`AppShell` calls `useAllMatches()` and `LiveTicker` calls `useLiveMatches()` unconditionally.

### Impact

Settings, favorites, and static pages still hit/persist live sports APIs, increasing baseline traffic and page work.

### Recommended Fix

Gate global queries by route, use lighter ticker data, or make the degraded banner subscribe only on data-heavy pages.

### Confidence

High

### Issue 27

### Issue

Match pages can duplicate expensive upstream lookups.

### Severity

Medium

### Location

`app/match/[id]/page.tsx`, `lib/streamed/client.ts`

### Evidence

`generateMetadata` and `MatchPage` both call `getMatchById`; `getMatchById` fetches today, live, and all matches.

### Impact

One page request can fan out to several upstream calls, increasing latency and rate-limit pressure.

### Recommended Fix

Use React `cache()`, route-level data loaders, or a direct upstream ID endpoint. Share metadata/page data where possible.

### Confidence

Medium

### Issue 28

### Issue

Telemetry polling is aggressive and duplicated across mounted panels.

### Severity

Medium

### Location

`components/match/live-scoreboard.tsx`, `components/match/match-analytics-tabs.tsx`, `components/stream/stream-telemetry-sidebar.tsx`

### Evidence

Each uses `refetchInterval: 5000` with the same query key.

### Impact

Popular pages can create heavy ESPN/API load. Polling continues for pre-match or stale events while panels stay mounted.

### Recommended Fix

Centralize telemetry in one hook, poll only for supported live matches, add backoff, and slow/disable polling outside live state.

### Confidence

High

### Issue 29

### Issue

Remote image failures have no component fallback.

### Severity

Medium

### Location

`components/match/team-badge.tsx`, `.next-dev.err`

### Evidence

`TeamBadge` renders `next/image` directly for Streamed badge URLs. Dev logs contain repeated upstream image `502` and timeout errors.

### Impact

Broken badges can degrade UX and generate noisy server logs.

### Recommended Fix

Add an `onError` fallback to initials, cache/proxy images, or use a resilient image component.

### Confidence

High

### Issue 30

### Issue

Stats route swallows parse errors silently.

### Severity

Medium

### Location

`app/api/stats/route.ts`

### Evidence

There are multiple empty handlers: `} catch(e) {}` and `} catch (e) {}`.

### Impact

Partial data loss is invisible to logs, Sentry, and callers.

### Recommended Fix

Capture breadcrumbs for each parse section and include `partial: true`/`missingSections` metadata in the response.

### Confidence

High

### Issue 31

### Issue

Dead/unused components and duplicate error boundaries exist.

### Severity

Low

### Location

`components/match/match-radar.tsx`, `components/match/stream-source-grid.tsx`, `components/stream/stream-telemetry.tsx`, `components/ui/error-boundary.tsx`, `components/system/error-boundary.tsx`, `lib/design/tokens.ts`

### Evidence

Repository search finds exports but no imports for these modules.

### Impact

Increases maintenance cost and hides which error/logging pattern is canonical.

### Recommended Fix

Remove unused modules or wire them into product flows. Consolidate to one error-boundary implementation.

### Confidence

High

### Issue 32

### Issue

Local storage privacy copy is inaccurate.

### Severity

Low

### Location

`components/system/settings-view.tsx`

### Evidence

The UI says data is stored "securely" in browser local storage.

### Impact

localStorage/IndexedDB are not encrypted secure stores; the text overstates privacy guarantees.

### Recommended Fix

Say "stored locally in this browser" and mention clearing browser/site data.

### Confidence

High

### Issue 33

### Issue

Root captured artifacts are corrupt, empty, or stale.

### Severity

Medium

### Location

`out.json`, `out_local.json`, `next_data.txt`, `schedule.html`, `out_all.json`, `out_today.json`

### Evidence

`out.json` is not valid JSON, `out_local.json` and `next_data.txt` are empty, and `schedule.html` is a captured rendered page.

### Impact

These files add repo noise, confuse tooling, and already contribute to lint/build hygiene problems when scratch scripts read them.

### Recommended Fix

Delete them, move intentional fixtures into `fixtures/`, or add a dedicated ignored `scratch/` folder.

### Confidence

High

### Issue 34

### Issue

No CI/CD, env example, or deployment config is present.

### Severity

Medium

### Location

Repository root

### Evidence

No `.github`, `vercel.json`, Dockerfile, `netlify.toml`, or `.env.example` was found.

### Impact

Build, lint, test, security checks, and required environment variables are not reproducible for collaborators or deployment.

### Recommended Fix

Add CI for `npm ci`, lint, typecheck, tests, build, and audit. Add `.env.example` documenting Sentry and site/origin variables.

### Confidence

High

### Issue 35

### Issue

Some query functions return values outside their declared data type.

### Severity

Low

### Location

`components/stream/stream-telemetry.tsx`, `components/match/live-scoreboard.tsx`, `components/match/match-analytics-tabs.tsx`, `components/stream/stream-telemetry-sidebar.tsx`

### Evidence

Examples include `if (!homeTeam || !awayTeam) return null;` or `return []` inside `useQuery<ComprehensiveMatchData>`.

### Impact

Future refactors can assume `ComprehensiveMatchData` and dereference fields that are actually `null`/array at runtime.

### Recommended Fix

Use `useQuery<ComprehensiveMatchData | null>`, return a typed empty telemetry object, or rely on `enabled` and throw if required params are missing.

### Confidence

Medium

## Testing Audit

Missing highest-priority tests:

1. `getMatchStatus`, `getCountdownLabel`, `getMatchParticipants`, `dedupeMatches`.
2. `toLocalDateString`, `getDaysRange`, `groupMatchesByHour`, calendar URL/ICS escaping.
3. Streamed client request behavior: success, non-OK, invalid JSON, timeout.
4. `/api/streamed/[...path]`: path encoding, invalid JSON, non-OK upstream, timeout.
5. `/api/stats`: missing params, no match, ambiguous teams, non-soccer unsupported, ESPN failures.
6. Zustand persistence actions for favorites, preferences, reminders, stale reminder pruning.
7. Search modal: only one dialog, shortcuts, escape, recent searches.
8. Schedule filters/date URL sync and custom date edge cases.
9. Watch page: no streams, multiple stream switching, iframe sandbox contract.
10. Playwright smoke: home, live, schedule, match detail, watch, settings, offline/degraded state.

## Production Readiness

- Internal testing: possible for manual demos after removing lint blockers.
- Beta release: not ready until stream iframe isolation, telemetry correctness, Sentry wiring, and basic tests are addressed.
- Production deployment: not ready.
- High-scale deployment: not ready due to polling, upstream dependency fragility, no rate limiting, no CI, and no cache strategy separation.

## Executive Summary

- Total issues found: 35
- Critical issues: 0
- High issues: 5
- Medium issues: 25
- Low issues: 5

## Risk Score

38/100

## Top 20 Highest-Priority Fixes

1. Sandbox and validate third-party stream iframes; add CSP.
2. Fix `/api/stats` to be sport-aware or clearly unsupported outside soccer.
3. Replace one-team substring telemetry matching.
4. Clean root scratch files so lint passes.
5. Add automated tests for API/client/selectors/schedule.
6. Add API input validation and rate limiting.
7. Add fetch timeouts and typed failure responses.
8. Add runtime schema validation for external APIs.
9. Stop returning 200 empty telemetry on upstream failure.
10. Complete Sentry App Router instrumentation/global error setup.
11. Disable Sentry client debug and tune sampling.
12. Restrict persisted TanStack queries and shorten sensitive TTLs.
13. Fix duplicate SearchCommand listeners/dialogs.
14. Implement reduced-motion behavior.
15. Encode all dynamic route path segments.
16. Escape ICS fields.
17. Address npm audit PostCSS/Next advisory path.
18. Add missing direct `@eslint/eslintrc` dev dependency.
19. Remove unused `cheerio`.
20. Add CI/CD and `.env.example`.

## Architecture Assessment

- Maintainability: Medium risk. Clear feature folders, but duplicated error boundaries, dead code, scratch artifacts, and weak schema boundaries hurt long-term clarity.
- Scalability: High risk. Global all-match fetches, 5s polling, no rate limits, and upstream fan-out will not scale safely.
- Security: High risk. Unsandboxed embeds and missing CSP/security headers are blockers for production.
- Reliability: High risk. Upstream failures are hidden, telemetry is often wrong, Sentry is incomplete, and image/API timeouts are visible in logs.
- Performance: Medium/high risk. First-load JS is around 197 kB shared, global queries run on all pages, and persisted cache is broad.
- Testability: High risk. Core logic is testable, but no test harness exists.

## Final Verdict

Not production ready.
