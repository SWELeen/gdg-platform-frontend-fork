# Decision and Source Governance

## Purpose

This document prevents product, technical, and task sources from being silently mixed or overridden. It applies to all frontend changes.

## Source Authority by Domain

- **Approved decisions** define the current accepted direction only when they explicitly supersede an older decision or document. Record material architecture and product decisions here.
- **Notion tasks** define the requirements and Definition of Done for the assigned task. They do not define unrelated architecture or current implementation details unless explicitly approved as a decision.
- **Swagger/OpenAPI** defines the current frontend-backend API contract: routes, methods, request and response schemas, authentication requirements, documented errors, and compatibility expectations. The frontend must not invent or silently diverge from this contract.
- **Repository code, tests, and configuration** define current implemented frontend behavior. If implementation materially differs from documentation, report the discrepancy; do not silently reconcile it.
- **Unified Platform Proposal** defines original product intent, platform goals, major product domains, and high-level user journeys. It is not a source for current low-level implementation details.
- **Web Doc Final** defines the approved technical baseline unless a later approved decision explicitly supersedes it. The current baseline is Next.js, React, TypeScript, Tailwind CSS, Framer Motion, and GSAP for frontend; NestJS, Node.js, and TypeScript for backend; MySQL and Prisma for persistence; NestJS Auth, JWT, Google OAuth, and RBAC for authentication and authorization; and Swagger/OpenAPI for the API contract.

## Conflict handling

Do not silently choose one source when sources conflict. First identify the conflict's domain, then apply the authority for that domain. If documented authority cannot resolve it, mark it `TBD` and request team clarification. Record material architecture or product decisions here. Do not change product behavior merely to make sources appear consistent.

## Current binding decisions

| Decision | Status |
| --- | --- |
| Frontend and backend are separate repositories | Approved |
| Next.js is frontend only | Approved |
| NestJS is the authoritative backend | Approved |
| Persistence uses MySQL and Prisma | Approved |
| Authentication uses NestJS Auth, JWT, Google OAuth, and backend-enforced RBAC | Approved direction |
| Swagger/OpenAPI is the authoritative frontend-backend contract | Approved |
| Leadership point balances are hidden from their recipients; designated higher-level point managers can view them. Ordinary members retain visibility of their own points. | Approved (user request, 2026-11-10) |
| Hosted browser API traffic uses a same-origin Next.js `/api` rewrite to the NestJS backend; session cookies are scoped to `/api` paths and use `SameSite=Strict` | Approved (user request, 2026-10-29) |
| Arabic uses a full RTL layout (`dir="rtl"` on `<html>`), not text-only direction | Proposed (2026-09-28) |
| three.js renders the 3D member badge on profile pages | Approved (2026-10-24) |

### 2026-09-28: Full RTL layout for Arabic

- **Owner:** Reman (i18n task); approver: team lead, pending PR review.
- **Context:** The i18n foundation (PR #12) kept `dir="ltr"` on `<html>` for every locale and flipped only text nodes. The i18n Notion task requires "RTL (Right-to-Left) layout for Arabic" and checking navigation, icons and alignment in both directions.
- **Decision:** The locale layout sets `dir` from `i18n/locale-metadata.ts`, so Arabic pages mirror entirely. Components use logical utilities and flip physical animation offsets via `useTextDirection()`.
- **Affected:** frontend only.
- **Migration:** Pages built with physical classes (`left-`, `pl-`, `text-left`, …) must be reviewed in Arabic. Rollback is restoring `dir="ltr"` in `app/[locale]/layout.tsx`.

### 2026-10-24: three.js for the 3D member badge

- **Owner:** Shumokh (member badges task); approval reported by Shumokh as granted by the team.
- **Context:** Committee members' profiles get a 3D badge, a hanging lanyard card that swings and can be dragged, ported from the mukhaverse portfolio. The approved stack (Next.js, React, Tailwind, Framer Motion, GSAP) has no 3D renderer.
- **Decision:** Add `three` (with `@types/three`) as a dependency. It's imported dynamically from `lib/badge/engine.ts` only when a badge mounts, so pages without a badge don't load it. When WebGL is unavailable the same card is painted flat on a 2D canvas.
- **Affected:** frontend only.
- **Migration:** Rollback is removing `three`, `lib/badge/engine.ts` and `components/badge/`. The card painter (`lib/badge/paint.ts`) has no three.js dependency.
- **Layout:** Chosen from three built options (badge view, side column, header). The badge hangs in a column beside the profile cards and stays in view while scrolling; on phones it sits between the header and the cards. Members without a committee see the page without a badge.
- **Badge content:** The headline is the committee role (Member, Co-Leader, Leader) and the line under it is the committee's short name. The member's uploaded photo replaces the silhouette when there is one; otherwise a female or male silhouette is chosen by the member's gender.
- **Colours:** Public Relations, Content Writing, Project Management and Digital Media & Design take Google green, yellow, blue and red. Web Development's dark slate GDG card is the default, and the other developer committees (Data Analysis, Cybersecurity, AIML, Automation, IoT & Robotics) use it until their colours are decided (`TBD`; marked "DEVELOPER COMMITTEE COLOURS" in `lib/badge/themes.ts`).
- **Data:** Name, photo, gender and committees come from `GET /me`, keyed by the backend's committee codes; see "Profile badge status" in `docs/api-integration.md`.
- **Open (`TBD`):** `/me` position values beyond Leader and Co-Leader (and positions like Advisor) are unconfirmed. Badge text is English in both locales.

### 2026-10-29: Same-origin API proxy for hosted browser sessions

- **Owner/approver:** User approval in this conversation; task tracker reference was not provided.
- **Context:** The hosted frontend and API use separate `onrender.com` sites. Cross-site `SameSite=None` cookies can be blocked by browser privacy controls.
- **Decision:** Browser API requests use the frontend origin under `/api/*`; the Next.js external rewrite forwards the request to the configured NestJS backend origin with `/api` removed. Production session cookies remain `HttpOnly`, `Secure`, and `SameSite=Strict`, scoped to `/api` and `/api/auth`. The backend continues to enforce authentication, authorization, and exact `Origin` checks.
- **Affected:** Frontend and backend repositories; frontend hosting must run the Next.js server/runtime and provide `API_PROXY_TARGET` and `NEXT_PUBLIC_USE_API=true`; backend `FRONTEND_URL` must match the frontend origin.
- **Migration/rollback:** The backend temporarily emits both old and new cookie paths so it can deploy before the frontend. After the frontend proxy is live and verified, remove legacy `/` and `/auth` cookie issuance while retaining logout cleanup for those paths for one release. To roll back, set frontend API traffic back to the direct backend URL and restore legacy cookie issuance. Browser sessions must be renewed after changing cookie paths.

### 2026-11-10: Leadership point visibility

- **Owner/approver:** User approval in this conversation.
- **Context:** Leadership roles can receive points managed by a higher leadership tier. Recipients must not see their own balances, and point managers need separate visibility boundaries.
- **Decision:** Committee Leaders and Co-Leaders cannot see their own point balance or history. Group Leader/Co-Leader and the overall Developer Committees Leader can see the balances of leaders in the six developer committees. For other committees, Group Leader/Co-Leader can see committee leader balances. The overall Developer Committees Leader cannot see their own points; Group Leader/Co-Leader can see that global balance. Ordinary members retain visibility of their own points. Backend responses and the member achievements UI enforce these rules.
- **Affected:** Backend point summaries, history, and dashboard API responses; frontend leadership dashboards and personal achievements page.
- **Migration/rollback:** No additional schema change for visibility filtering. Keep the existing point-ledger migration required for the separate overall Developer Committees Leader balance. Rollback is reverting the backend response filtering and frontend visibility conditions together.

## Decision record minimum

Each new decision should record: date, owner/approver, status, context, decision, affected repositories, source links, and migration or rollback implications. Link the exact Notion task for task-scoped work.

## Legacy-source clarification

Web Doc Final describes some Next.js full-stack capabilities, including Server Actions. For this platform's backend responsibilities, that guidance is superseded by the approved separate-repository architecture: Next.js is frontend only and NestJS is authoritative.

## 2026-11-13 — Better Auth migration

Owner-authorized migration replaces Supabase Auth with backend-owned Better Auth and Resend email. The Next.js frontend retains its existing same-origin API proxy and bilingual interface; it does not become an authentication authority. Base verified with fetch/prune and remote/PR inspection: origin/main `15c68e2914f5de63fb1c8ac73486dedf3a068d5a`, latest integration branch, no open PRs. See backend `docs/auth-migration-plan.md` for the coordinated plan. Implementation is in progress, not ready for deployment. No push or PR is authorized.

Native Better Auth requests retain `/api/auth/*` through the Next rewrite. Application profile operations move to `/api/account/*` (backend `/account/*`) to avoid namespace collisions; credential operations use native Better Auth response shapes. See backend `docs/better-auth-openapi.yaml` and Better Auth's generated `/api/auth/open-api/generate-schema` contract. Frontend flow migration is still in progress.

The frontend credential migration now uses Better Auth for password sign-in, Google OAuth initiation, session-aware callback, reset request/completion, verification resend and logout. Staged application signup stays backend-owned at `/account/signup`. Supabase browser SDK and temporary bearer token handoff were removed. Verification uses links instead of OTP entry; no magic-link sign-in is enabled.
