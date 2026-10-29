# Frontend Architecture

## Responsibility

This repository delivers the web interface for the GDG Main Platform. It is a separate application from the backend and communicates with it over HTTP API calls.

```
Browser -> Next.js same-origin /api proxy -> NestJS API -> Prisma -> MySQL
```

The frontend does not become an alternate backend. The NestJS API is the source of truth for server-side authentication, RBAC enforcement, validation, persistence, and domain decisions.

The Web Doc Final describes some Next.js full-stack capabilities, including Server Actions. Those descriptions are superseded for platform backend responsibilities by the approved separate-repository architecture: NestJS is the authoritative backend, and Next.js is frontend only.

## Technology boundaries

| Concern | Frontend responsibility | Backend responsibility |
| --- | --- | --- |
| Rendering and interaction | Next.js / React | Not applicable |
| Styling and motion | Tailwind CSS; Framer Motion / GSAP when appropriate | Not applicable |
| API access | Call documented endpoints and render their results | Define and serve endpoints |
| Authentication UI | Start/complete documented user flows | Verify identity and issue/manage auth state |
| Authorization | Hide or disable unsupported UI as a usability aid | Enforce permission checks authoritatively |
| Data | Display and submit documented DTOs | Validate and persist data via Prisma/MySQL |

## Platform areas the UI may represent

The product proposal describes public and authenticated experiences around membership, applications, events, registrations, profiles, teams, tasks, announcements, recommendations, attendance, organizational structure, and an internal directory. It also proposes role-based dashboards.

This list is product scope, not a release plan or route map. Exact pages, URL structure, data fields, roles, permissions, and acceptance criteria are **TBD** until product and API requirements are approved.

## Configuration

When the API is enabled, the browser calls the frontend origin at `/api/*`; the Next.js rewrite strips `/api` and forwards to the server-only `API_PROXY_TARGET`. Enable the API with `NEXT_PUBLIC_USE_API=true` for production and local API development. Locally, the rewrite defaults to `http://localhost:3001`. `NEXT_PUBLIC_API_URL` remains a demo-mode fallback when the integration toggle is off. The backend's `FRONTEND_URL` must exactly match the public frontend origin.

Only variables safe for browser exposure may use `NEXT_PUBLIC_`. Secrets, private API keys, database URLs, OAuth secrets, and JWT secrets must never be included in client bundles.

## Non-goals

- Direct MySQL or Prisma use.
- A Next.js API layer that duplicates NestJS routes or business logic. The `/api` rewrite is transport-only.
- A parallel authorization system.
- Rebuilding the existing games platform. Its future placement, identity integration, and data-sharing contract are **TBD** until explicitly approved.
