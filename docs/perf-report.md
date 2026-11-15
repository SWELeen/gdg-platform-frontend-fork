# Performance and smoothness report

Pass-1 evidence is retained below. See [Second performance pass](#second-performance-pass--visual-parity-first) for the latest results and owner-requested regression evidence.

Tested 2026-11-14 on macOS with installed Chrome, production Next.js 16.3.4. Baseline: `origin/main` at `77646e3`; branch: `perf/smoother-site`. The existing auth worktree and backend were not modified.

## Live site and coverage

`https://gdguj.org` was opened in the shared browser and failed to load (`chrome-error://chromewebdata/`). Repository README, setup, hosting references, GitHub homepage and deployment records did not identify a confirmed replacement frontend URL. Render examples are placeholders, not verified deployments. After opening PR #136, Netlify hosting checks revealed `https://jazzy-dieffenbachia-4188da.netlify.app`. Opening that hostname redirects to Netlify Team Protection and displays “This site is private” / “Sign in with an invited Netlify account to view it.” The host is reachable but the application is access-restricted; live application performance remains TBD. All measurements below use `http://localhost:3100`, built with `npm run build` and served with `npm run start -- --port 3100`.

Both baseline and candidate production builds pass. API integration was left at the checkout default (demo mode); no environment files or credentials were copied. The backend is unavailable on port 3001. Authenticated dashboard, real event/announcement detail records, QR camera access and an authenticated three.js badge session could not be exercised. Protected routes were checked as signed-out navigation/redirects, not as signed-in content.

## Method

- Lighthouse: one cold run per locale/device before and after, default simulated mobile throttling and desktop preset; performance category. These are directional lab results, not field Core Web Vitals or a statistically stable median.
- Playwright + CDP: 1440×900 desktop; 390×844 mobile, 4× CPU, 150 ms latency, 200,000 bytes/s download and 93,750 bytes/s upload. Fresh context per route; 16 main routes × 2 languages × 2 device profiles = 64 observations per revision.
- Mobile route observations use an 8-second home / 3-second other-page window after DOMContentLoaded. Some routes have not hydrated by that deadline; zero LCP/JS/task values are incomplete observations, not fast results. Desktop baseline waited for load; candidate used DOMContentLoaded plus the same settling delay, so use Lighthouse for LCP comparisons.
- Scroll: three seconds of requestAnimationFrame-driven 18 px steps, reporting frame rate, p95 interval and frames over 50 ms. Headless synthetic scroll does not prove real-device compositor smoothness. Chrome timeline traces cover that interval.
- Separate settled interaction probe counts mutations on the actual ribbon SVG for one second, then scrolls offscreen and back; also clicks both language-switch directions, and repeats with reduced motion. Observed interaction duration is a lab event timing sample, not field INP; Lighthouse TBT is the blocking proxy.
- The image sampling pass requests repeated scroll positions at both viewport widths and sums completed image resource body bytes. CSS smooth scrolling may coalesce those positions, so this is a sampled traversal, not a complete lazy-asset inventory. Lighthouse total-transfer results provide the standardized startup comparison. Route JS bytes are completed compressed body transfers for `.js` resources, including route prefetch; they are not an analyzer estimate of exclusive module size. Next 16 build output lists routes but does not print bundle sizes.

## Lighthouse before / after

| Locale / device | Performance | LCP | CLS | TBT | Long tasks | Total transferred |
|---|---:|---:|---:|---:|---:|---:|
| EN / desktop | 88 → 94 | 2.27 s → 1.68 s | 0.0005 → 0.0005 | 0 ms → 0 ms | 0 → 0 | 20.77 MiB → 3.09 MiB |
| EN / mobile | 62 → 75 | 13.08 s → 9.48 s | 0.0000 → 0.0000 | 202 ms → 20 ms | 3 → 3 | 20.70 MiB → 3.03 MiB |
| AR / desktop | 92 → 94 | 1.86 s → 1.67 s | 0.0005 → 0.0005 | 0 ms → 0 ms | 0 → 0 | 20.83 MiB → 3.16 MiB |
| AR / mobile | 75 → 75 | 12.71 s → 9.79 s | 0.0000 → 0.0000 | 14 ms → 16 ms | 2 → 2 | 20.76 MiB → 3.09 MiB |

## Image weight and offscreen work

| Measurement | Before | After |
|---|---:|---:|
| Sampled-scroll images, 1440 px | 20.10 MiB | 2.43 MiB (87.9% less) |
| Sampled-scroll images, 390 px | 17.39 MiB | 2.35 MiB (86.5% less) |
| EN offscreen ribbon writes/s | 1920 | 0 |
| AR offscreen ribbon writes/s | 1920 | 0 |

Normal-motion ribbons still animate onscreen and resume after scrolling back. Reduced-motion ribbons make zero geometry writes in both revisions. Candidate assertions enforce those behaviors. Language switching had zero measured CLS in both directions; no horizontal overflow. Event timing samples are recorded in the interaction JSON; full-page navigation can reset entries, so they do not establish INP.

## Main-route JS transfers (desktop, KiB)

| Route | EN before → after | AR before → after |
|---|---:|---:|
| / | 284.3 → 285.8 | 284.3 → 285.8 |
| /announcements | 386.9 → 388.5 | 386.9 → 388.5 |
| /event-registration | 152.7 → 153.0 | 152.7 → 153.0 |
| /login | 391.5 → 393.1 | 391.5 → 393.1 |
| /signup | 391.5 → 393.1 | 391.5 → 393.1 |
| /signup/pending | 316.7 → 318.3 | 316.7 → 318.3 |
| /signup/verify | 318.4 → 320.0 | 318.4 → 320.0 |
| /signup/complete | 382.0 → 383.5 | 382.0 → 383.5 |
| /forgot-password | 384.3 → 385.9 | 384.3 → 385.9 |
| /forgot-password/verify | 318.3 → 319.8 | 318.3 → 319.8 |
| /reset-password | 321.3 → 322.8 | 321.3 → 322.8 |
| /activate | 228.5 → 228.6 | 228.5 → 228.6 |
| /profile | 312.2 → 313.8 | 312.2 → 313.8 |
| /registrations | 319.4 → 320.9 | 264.2 → 264.3 |
| /create-event | 418.6 → 420.0 | 418.6 → 420.0 |
| /dashboard | 416.1 → 417.5 | 416.1 → 417.5 |

There is no substantial JS reduction: three.js and html5-qrcode already load dynamically at the badge/scanner, and GSAP has no active imports. The added motion preference provider and lifecycle handling add a small amount of JS. No heavy dependency was moved into the homepage. Font transfers did not improve in these samples: Roboto already reused variable resources; its declaration now explicitly uses the variable font and both fonts explicitly use `display: swap`.

## Scroll traces

| Locale / device | FPS before → after | p95 frame ms | Frames >50 ms |
|---|---:|---:|---:|
| EN / desktop | 59.3 → 60.3 | 16.8 → 16.7 | 1 → 0 |
| AR / desktop | 60.3 → 60.3 | 16.8 → 16.8 | 0 → 0 |
| EN / mobile | 60.3 → 58.7 | 16.7 → 16.8 | 0 → 1 |
| AR / mobile | 60.3 → 58.7 | 16.7 → 16.8 | 0 → 0 |

The fixed-window mobile traces include incomplete hydration; their near-60 FPS does not mean the interactive animation ran smoothly. The settled SVG mutation probe is the evidence for eliminating offscreen animation work. Traces are gzip-compressed in `docs/perf/*-trace.json.gz`; decompress and load into Chrome Performance. FPS was already near 60 on the test desktop, so no broad FPS improvement is claimed.

## Remaining limits

Mobile LCP remains about 9.5–9.8 seconds under Lighthouse simulation, so mobile loading needs further improvement. These gains do not establish good field Core Web Vitals.

Announcements and registrations already show CLS above 0.1 in some loading/state-transition samples (baseline registrations up to 0.552). Their raw route observations remain in the report; this patch does not establish that those flows meet Core Web Vitals. Fonts still transfer roughly 172–229 KiB depending on locale; portraits loaded on scrolling remain a source of image weight. Production API/CDN behavior, signed-in badge rendering and camera scanning need a live/session-backed follow-up.

## Changes

- About photos and leadership images use `next/image`, intrinsic dimensions and responsive `sizes`; their existing positioning, crops and motion are retained.
- Hidden mobile committee portraits load lazily and decode asynchronously. SVG portrait hrefs are assigned only within 400 px of the viewport, keeping hidden desktop layouts out of mobile startup downloads.
- Ribbon geometry callbacks stop when the SVG is offscreen or the document is hidden, with observer/listener cleanup. Decorative looping hero motion settles offscreen and for reduced motion.
- Mobile offer selection batches scroll work into one frame and skips layout reads on desktop/offscreen.
- About counters cancel pending animation frames on unmount and resolve directly to their final count with reduced motion.
- Shared Framer Motion preferences respect the OS setting; reduced-motion CSS also disables smooth scrolling. The badge engine sleeps while the document is hidden and wakes when visible.

## Coverage and checks

- Before: 192 concrete AR/EN page URLs; 0 browser-exception cases; 0 horizontal-overflow cases. Dynamic identifiers require real data and are excluded. See [before route sweep](perf/before-routes.json).
- After: 192 concrete AR/EN page URLs; 0 browser-exception cases; 0 horizontal-overflow cases. Dynamic identifiers require real data and are excluded. See [after route sweep](perf/after-routes.json).
- No hydration exceptions in the main-route probes. Both revisions record eight unavailable-backend network-error observations on protected flows and two existing announcement-page 404 resource observations. No new console-error class was introduced; see raw observations.
- `npm run build`: passes before and after (Turbopack, no font workaround required).
- `npm run typecheck`: passes.
- `node scripts/check-theme-toggle.mjs`: passes. No `test` script is defined on main.
- Changed-file ESLint: zero errors, one existing unused `CX` warning. Full `npm run lint`: same six existing errors, warnings reduced from 15 to 12. Errors remain in profile, blacklist and shared dashboard state-reset effects; changing their behavior is outside this performance patch.
- `git diff --check`: passes.
- Interaction assertions: offscreen stop, onscreen resume, reduced-motion behavior, RTL/LTR direction and overflow.

## Screenshots and raw data

| Locale / viewport | Before | After |
|---|---|---|
| EN / desktop | [PNG](perf/before-en-desktop.png) | [PNG](perf/after-en-desktop.png) |
| EN / mobile | [PNG](perf/before-en-mobile.png) | [PNG](perf/after-en-mobile.png) |
| AR / desktop | [PNG](perf/before-ar-desktop.png) | [PNG](perf/after-ar-desktop.png) |
| AR / mobile | [PNG](perf/before-ar-mobile.png) | [PNG](perf/after-ar-mobile.png) |

Screenshots show the same homepage layout at the observation deadline. Ribbon phase and loading progress naturally differ; mobile screenshots can show pre-hydration content. Raw Lighthouse files, build output, route observations, interaction samples, sampled image-resource inventories and compressed traces are in [perf/](perf/).

## Reproduction

Recorded tooling: Node 26.13.0, Playwright 1.65.0; Lighthouse/Chrome versions are in each raw report.

Install Playwright outside the repository, then point `PERF_PLAYWRIGHT_MODULE` at its `index.mjs`, or install it locally without changing the manifest/lockfile. Set `CHROME_PATH` if Chrome is not at the default macOS location. With the production server on port 3100:

```sh
PERF_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/perf/audit.mjs after
PERF_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/perf/interactions.mjs after
PERF_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/perf/images.mjs after
PERF_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/perf/routes.mjs after
npx lighthouse http://localhost:3100/en --only-categories=performance --output=json --output-path=mobile.json --chrome-flags="--headless --no-sandbox"
npx lighthouse http://localhost:3100/en --preset=desktop --only-categories=performance --output=json --output-path=desktop.json --chrome-flags="--headless --no-sandbox"
```

Repeat Lighthouse for `/ar`; use `before` on the baseline revision. The original desktop route probe used the load event; the checked-in script standardizes on DOMContentLoaded. The raw Lighthouse JSON records Chrome/Lighthouse versions, exact viewport and throttle settings. Dependency installation used the existing pnpm 12.4.1 JS entrypoint because the shell did not have pnpm on PATH; the manifest and lockfile are unchanged.

The final SVG deferment was also checked by scrolling directly to the committee section: all eight desktop SVG portraits received hrefs and retained nonzero dimensions.

## Second performance pass — visual parity first

Baseline: PR #136 at `4022134`, based on main `77646e3`. Fetching all remotes confirmed main had not moved. No auth branches, backend code, other environment configuration, or dependency versions were changed.

### Scope and owner guardrails

The owner added strict non-regression requirements after initial experiments had begun. An immutable copy of `4022134` was therefore rebuilt separately to reconstruct the exact baseline for the visual/functional comparison. The original images, animations, loading states and auth behavior take precedence over a lower Lighthouse score.

The retained source changes are deliberately small and independently revertible:

- Preload/high-priority discovery for the native navbar brand and event hero. Their original raster pixels are retained (`unoptimized`), with correct layout dimensions; no resampling/codec change is shipped.
- Lazy/asynchronous loading for the existing offscreen footer, sponsors and phone images. The image sources, CSS, crops and animations remain the same.
- Stop preloading all four Arabic font weights on every English page. The font families, weights, unicode subsets, `swap` behavior and metric-adjusted fallback remain unchanged.
- Render the existing demo registration fixtures in initial server HTML. API-enabled registrations continue to fetch private data exactly as before; no shared user-data cache was introduced.

Experiments rejected/reverted under the guardrails: resampled/compressed replacements that changed screenshot pixels or geometry; removal of entrance fades; broad lazy Framer feature loading; removal of the announcements loading skeleton. Three.js is already dynamically imported at badge mount; GSAP has no runtime imports. Their behavior was not changed in this pass.

### Method

Lighthouse 13.6.0, Chrome 157, production Next.js builds (`next build` / `next start`). The baseline is one cold mobile run per route/locale on the pass-1 revision; the final result is the median of three sequential cold-browser runs per route/locale. Default simulated mobile throttling uses 150 ms RTT, 1638.4 Kbps throughput and 4× CPU. Browser caches are fresh; the server's image cache may warm. Navigation traces and network logs are retained for the first run of each route/locale, with all Lighthouse reports gzip-compressed in `docs/perf/pass2/`.

Only home had historical pass-1 Lighthouse data. The other “before” values were newly measured on the unchanged pass-1 commit. `/create-event` and `/dashboard` include signed-out redirects to login. Profile is signed-out coverage. These are not measurements of authenticated content. Demo mode does not establish live backend latency, field INP or private-hosting performance.

### Visual and functional comparison

Full-page captures cover 16 main routes × AR/EN × 1440/390-pixel widths × light/dark = **128 screenshots per revision**. Screenshots settle fonts and lazy artwork, then finish finite browser animations, pause repeating browser animations and cancel pending JavaScript animation frames for the capture only. Two consecutive identical full-page captures are required. Normal/reduced motion is exercised separately on live pages, without freezing. The harness compares dimensions, pixels, rendered text, controls, link targets and final URLs. Pixelmatch uses threshold 0.1 with anti-aliasing excluded; exact RGBA pixel differences are also counted. Any significant difference is investigated rather than silently accepted by a percentage threshold.

The initial resampling experiment produced small geometric/pixel differences; those optimizations were reverted. Full baseline/candidate images, diffs, inventories and repeat controls are checked in under [pass2/visual](perf/pass2/visual/).

The extended Playwright checks cover both locales, widths and themes: menu navigation, theme toggles, both language-switch directions, RTL, invalid login/signup/reset inputs, login step progression and password visibility. The separate ribbon probe checks offscreen stopping, onscreen resumption and reduced-motion behavior. The 192-URL sweep checks page exceptions, server errors, direction and horizontal overflow before and after.

**Not exercised:** authenticated QR camera decoding, authenticated 3D badge interaction, real backend mutations/event registration, and valid recovery/invitation links. No suitable authenticated session/camera/backend dataset was supplied. Tests do not fabricate those passes. No new code changes were retained in those features; the broad animation optimization was reverted to contain that risk.

### Routing and caching

Explicit `/en/...` and `/ar/...` URLs return 200 without a locale redirect. `/` adds one locale-selection 307. Existing locale-aware links already use explicit locale paths. Authorization redirects remain intact. Hashed framework assets already use one-year immutable caching; optimized images already have a four-hour cache policy. No blanket cache header was added to private/API responses. Announcement fetching remains `no-store`, so production backend latency is a separate unmeasured factor.

### Final regression results

Visual comparison: **128/128** pairs retain identical geometry, rendered text, links, controls and destinations. **122** pairs are RGBA-identical; **124** have zero perceptual differences. Two activation captures have 9/12 anti-aliasing pixels. The other four pairs were inspected: three preserved animation/transform phases on home, and a 102-pixel header-logo raster difference reproduced by baseline-versus-baseline controls. See the [visual investigation](perf/pass2/visual/README.md), full screenshots and negative controls. No remaining layout/content/design difference was identified; this is not a claim that all screenshots are pixel-identical.

| Functional check | Before | After |
|---|---:|---:|
| Main-route visual/inventory cases | 128 passed | 128 passed |
| Extended locale × viewport × theme interaction cases | 8 passed | 8 passed |
| Concrete URL assertions | 192 passed | 192 passed |
| Normal/reduced-motion ribbon and locale-switch cases | 4 passed | 4 passed |
| Demo registration actions + settled event-image fallback | 4 passed | 4 passed |
| Browser exceptions / horizontal-overflow cases in URL sweep | 0 / 0 | 0 / 0 |
| Observed language-switch event duration | 40 ms | 40–64 ms |
| Language-switch CLS | 0 | 0 |

The event samples are local desktop observations, not field INP. The small event-duration increase is not treated as evidence of an INP regression or a mobile pass. Authenticated QR/3D/backend scenarios remain **unverified** in both revisions.

The targeted demo checks exercise dialog dismissal, confirmation/cancellation feedback and failed-image replacement, blocking all non-GET/HEAD requests. An additional early-image-failure probe exposed an existing baseline bug: when the initial image fails before hydration, the raw image's error callback can be missed. The baseline's first case timed out waiting for its fallback; the candidate passed all four locale/width cases with the Next Image wrapper. The [baseline failure log](perf/pass2/checks/baseline-early-image-failure.txt) and [candidate results](perf/pass2/after-early-image-failure.json) are retained. The standard settled-failure probe passes four cases on each revision; the earlier failure is not hidden as a blanket baseline pass.

### Final mobile Lighthouse results

After = median of three runs per route/locale (96 total, no runtime errors); before = one run on the pass-1 revision. CLS and TBT columns are after medians. Historical pass-1 home LCP was 9.48/9.79 s; the new baseline reproduction was 9.49/9.79 s.

| Route | EN LCP before → after (s) | AR LCP before → after (s) | CLS EN / AR | TBT EN / AR (ms) |
|---|---:|---:|---:|---:|
| / | 9.49 → 4.43 | 9.79 → 5.57 | 0.000 / 0.000 | 17 / 19 |
| announcements | 1.20 → 1.20 | 5.14 → 5.36 | 0.271 / 0.000 | 1 / 2 |
| event-registration | 4.58 → 3.68 | 4.58 → 4.58 | 0.000 / 0.000 | 0 / 0 |
| login | 6.25 → 5.19 | 6.70 → 6.46 | 0.000 / 0.000 | 1 / 1 |
| signup | 6.32 → 5.41 | 6.62 → 6.38 | 0.000 / 0.000 | 0 / 1 |
| signup/pending | 5.71 → 4.74 | 6.02 → 5.48 | 0.000 / 0.000 | 1 / 1 |
| signup/verify | 5.71 → 4.73 | 6.02 → 5.64 | 0.000 / 0.000 | 1 / 1 |
| signup/complete | 1.20 → 1.20 | 1.20 → 1.20 | 0.000 / 0.000 | 0 / 1 |
| forgot-password | 5.80 → 5.26 | 6.10 → 6.16 | 0.000 / 0.000 | 0 / 1 |
| forgot-password/verify | 5.71 → 4.73 | 6.01 → 5.64 | 0.000 / 0.000 | 1 / 1 |
| reset-password | 5.11 → 4.81 | 6.10 → 5.71 | 0.000 / 0.000 | 0 / 1 |
| activate | 1.21 → 1.20 | 1.20 → 1.20 | 0.000 / 0.000 | 0 / 1 |
| profile | 1.20 → 1.20 | 1.20 → 1.20 | 0.002 / 0.002 | 0 / 1 |
| registrations | 1.20 → 1.20 | 1.20 → 1.20 | 0.000 / 0.039 | 1 / 1 |
| create-event | 6.68 → 5.72 | 7.07 → 6.99 | 0.000 / 0.000 | 0 / 0 |
| dashboard | 6.54 → 5.79 | 6.87 → 6.84 | 0.000 / 0.000 | 0 / 1 |

TBT medians are 0–19 ms (maximum individual run 20.5 ms). CLS is below 0.1 outside announcements: English announcements remains 0.271; Arabic's median of 0 hides one 0.344 run. Arabic announcement LCP spans 4.66–5.51 s and its median is slightly worse than the single before sample; Arabic forgot-password also shows no improvement. These small differences are not presented as statistically established regressions or gains. Registrations CLS improves from 0.541/0.541 to 0/0.039.

### LCP element identification

These are the first-run trace candidates. The compressed traces preserve candidate node names even when a temporary loading node was removed before DOM inspection.

| Route | EN LCP element | AR LCP element |
|---|---|---|
| / | Navbar brand image | Navbar brand image |
| announcements | Temporary loading-hero paragraph | Navbar brand image |
| event-registration | Event hero image | Event hero image |
| login | Email-step heading | Email-step heading |
| signup | Account-creation heading | Account-creation heading |
| signup/pending | Approval-state paragraph | Approval-state paragraph |
| signup/verify | Code instructions paragraph | Verification heading |
| signup/complete | Footer description | Footer description |
| forgot-password | Recovery heading | Recovery heading |
| forgot-password/verify | Code instructions paragraph | Verification heading |
| reset-password | Invalid-link message | New-password heading |
| activate | Create-password heading | Create-password heading |
| profile | Footer description | Footer description |
| registrations | Page-description paragraph | First registration title |
| create-event | Login heading after redirect | Login heading after redirect |
| dashboard | Login heading after redirect | Login heading after redirect |

Signup completion/profile results measure their unsigned/tokenless shells, not successful authenticated workflows. The explicit-localized paths do not incur a locale redirect; create-event/dashboard timings include their auth redirects.

### What still delays rendering

The target is **not met across all routes**. This pass does not establish a hard lower bound; it retains the existing visuals and behavior while documenting the next constraints:

- Home's measured LCP is the native navbar brand image, not the 3D badge. It still transfers 119,009 bytes to preserve its exact raster. Startup also transfers about 257 KiB of scripts and 36 KiB of CSS; Lighthouse identifies two blocking CSS resources and approximately 70 KiB of unused JavaScript in the first-run home audit. The shared Framer/client graph remains. Broad feature loading and entrance-animation changes were reverted rather than claiming behavior parity without adequate evidence.
- English font transfer falls from 174 KiB to 37 KiB; Arabic remains 232 KiB because the page uses those faces/weights. Glyph subsetting against a fixed text inventory could exclude future Arabic backend content, so no glyph coverage was removed. The existing metric-adjusted fallback and font-display swap remain.
- Auth headings and explanatory text are in server HTML but begin inside preserved opacity/slide transitions. Their visible rendering still depends on hydration, the shared client graph, fonts and entrance timing. Login/signup/recovery/verification routes therefore do not become fast merely by reducing preload contention. Signed-out create-event/dashboard add their existing authentication navigation before the login content. Removing these transitions or changing auth routing was rejected.
- Event registration's LCP is the original event image. Earlier discovery helps, but the native payload, common CSS/font traffic and render delay remain. Resampling/compression trials were reverted after pixel differences; the production image/fallback path is retained.
- Announcements still streams a loading hero/skeleton before the final content. In English, the trace's LCP candidate is the temporary hero paragraph (`P.mt-5.text-base.text-gray-500`), already removed by Lighthouse's DOM inspection. Its low LCP does **not** mean final announcement data is ready. In Arabic the candidate is the navbar logo. The skeleton/content transition retains the existing CLS failure and variability. Removing that boundary changed the loading behavior, so the experiment was reverted.
- Demo registrations now has its existing fixtures in initial HTML instead of replacing a short loading state after hydration. API-enabled/private registrations keep their current fetch path. Public announcement API requests remain `no-store`; detail lookup can fall back to a second collection fetch. No real backend was available to measure that waterfall or justify caching freshness changes. No third-party script was a startup bottleneck in the recorded home audits.

The first-run home transfer totals are **3.03 → 0.75 MiB EN** and **3.09 → 0.94 MiB AR**. These include a 91 KiB favicon and browser-loaded nearby images, not just the LCP request. Request inventories, LCP nodes, observed trace breakdowns, CSS blockers, main-thread categories and CLS culprits are extracted in [diagnostics.json](perf/pass2/diagnostics.json). Observed localhost trace subparts must not be added to the simulated mobile medians: they are different timing models.

### Checks and reproduction

Production build, TypeScript and theme-toggle tests pass. Changed-source ESLint has zero errors (four pre-existing native-image warnings). Full lint retains the same six pre-existing state-reset-effect errors, with 11 warnings. No general `test` script exists. Build/typecheck/lint/theme logs are in [checks](perf/pass2/checks/). The four source optimizations are separate commits: `b1a65e8`, `5f232b0`, `1f57e77`, `02f4119`.

The badge asset loader explicitly awaits its required fonts before painting canvas text (`lib/badge/paint.ts`); no font face/weight was removed. This static check bounds the font-loading risk but is not an authenticated badge interaction test.

Run the original PR head in an isolated checkout/archive on 43101, and the final candidate on 3100. Both use production builds with the same demo configuration. Install audit tooling outside the repository; no project dependency changes are needed.

```sh
# Paths point to separately installed audit tools.
export PERF_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs
export PERF_PNG_MODULE=/absolute/path/to/pngjs/lib/png.js
export PERF_PIXELMATCH_MODULE=/absolute/path/to/pixelmatch/index.js
export LIGHTHOUSE_CLI=/absolute/path/to/lighthouse/cli/index.js

PERF_BASE_URL=http://localhost:43101 node scripts/perf/visual-regression.mjs before
node scripts/perf/visual-regression.mjs after
node scripts/perf/visual-diff.mjs
PERF_BASE_URL=http://localhost:43101 node scripts/perf/functional.mjs before
node scripts/perf/functional.mjs after
PERF_BASE_URL=http://localhost:43101 node scripts/perf/changed-features.mjs before
node scripts/perf/changed-features.mjs after
# Optional early-load error reproduction: baseline is known to fail this probe.
PERF_EARLY_IMAGE_FAILURE=1 PERF_BASE_URL=http://localhost:43101 node scripts/perf/changed-features.mjs before-early
PERF_EARLY_IMAGE_FAILURE=1 node scripts/perf/changed-features.mjs after-early
PERF_BASE_URL=http://localhost:43101 node scripts/perf/routes.mjs pass2-before
node scripts/perf/routes.mjs pass2
PERF_BASE_URL=http://localhost:43101 node scripts/perf/interactions.mjs pass2-before
node scripts/perf/interactions.mjs pass2

# Benchmark only one browser at a time, with the intended build on 3100.
# Run "before" on 4022134; then rebuild the candidate for "after".
node scripts/perf/lighthouse-matrix.mjs before 1
node scripts/perf/lighthouse-matrix.mjs after 3
node scripts/perf/summarize.mjs
```

The Lighthouse runner resumes from its phase's summary. Use a fresh phase/output directory when changing the candidate; do not mix builds inside a median. The visual harness defaults to `/tmp/gdg-pass2-visual`; `PERF_VISUAL_DIR` overrides it. `PERF_VISUAL_KEYS=ar-signup-complete-390-light` reproduces the isolated repeat control with phases `before-repeat` and `after-repeat`. Runtime API/camera/auth limitations remain explicit in the functional JSON.
