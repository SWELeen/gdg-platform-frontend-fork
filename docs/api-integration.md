# API Integration

## Contract-first rule

The frontend consumes the separate NestJS backend through its published Swagger/OpenAPI contract. This contract is authoritative for implemented endpoint behavior. Its location, versioning policy, generated-client choice, and release workflow are **TBD**, but the frontend must not treat their absence as permission to invent a contract.

Until then, do not invent:

- endpoint paths or HTTP methods;
- request or response fields;
- enum values, role names, or permission semantics;
- auth headers, cookie strategy, token storage, refresh flow, or error envelope;
- pagination, filtering, upload, or retry conventions.

## Integration checklist

For each API-backed UI capability, confirm:

| Item | Required confirmation |
| --- | --- |
| Endpoint | Method and path |
| Request | DTO, required fields, validation feedback |
| Response | DTO and nullable/optional fields |
| Access | Authentication and backend permission requirement |
| States | Loading, empty, domain error, network failure, unauthorized/forbidden |
| Change control | Contract version or compatible-change decision |

Do not consume a production-facing endpoint unless the published specification contains its operation and security requirement. If a needed operation does not exist, record the requested behavior in the approved Notion task and coordinate the backend contract change first.

## Local configuration

Run the frontend at `http://localhost:3000` and the backend API at `http://localhost:3001`. When `NEXT_PUBLIC_USE_API=true`, the browser uses the same-origin `/api/*` path and the Next.js rewrite targets `API_PROXY_TARGET` (default `http://localhost:3001`). The checked-in `.env.example` and local `.env.local` should use the local target. Use the backend repository Docker Compose setup for a local API and database; it overrides the ignored backend `.env` database URL with the local Docker database. `NEXT_PUBLIC_API_URL` is retained as a fallback for demo-mode API calls when the integration toggle is off.

## Hosted same-origin API proxy

For hosted deployments without a custom domain, the browser calls the frontend origin at `/api/*`. The Next.js rewrite forwards `/api/<path>` to `API_PROXY_TARGET/<path>`; set `API_PROXY_TARGET` to the bare HTTPS backend origin (for example, `https://gdg-platform-backend.onrender.com`) on the frontend host. Set `NEXT_PUBLIC_USE_API=true` on the frontend before its production build. When the integration is enabled, the API client uses `/api`; `NEXT_PUBLIC_API_URL` is not required in the hosted frontend. `API_PROXY_TARGET` is server-side configuration and must not use the `NEXT_PUBLIC_` prefix. The frontend must run with the Next.js server/runtime so external rewrites are active; static export is not supported for this setup.

The backend scopes its final HttpOnly session cookies to the proxy paths: `gdg_access` uses `/api`, and `gdg_refresh` uses `/api/auth`. During rollout, it also issues the legacy `/` and `/auth` cookies until the frontend proxy is deployed and verified; remove legacy issuance in a follow-up backend deploy. The rewrite removes `/api` before forwarding, so the backend continues to receive its existing route paths such as `/auth/refresh`. Keep `credentials: "include"` in frontend requests, `FRONTEND_URL` set to the exact public frontend origin, and the backend's exact Origin validation enabled. The proxy must forward the browser's `Origin` and `Cookie` request headers and pass `Set-Cookie` response headers through unchanged. Final production cookies use `SameSite=Strict; Secure`; logout clears both current and legacy paths during migration. The proxy adds a server hop for IP-based rate limits: set `TRUST_PROXY_HOPS` only to the verified trusted-proxy count for the actual Netlify/Render route, never to a blanket trust setting. An incorrect count can make users share an IP bucket or trust spoofed forwarded IPs.

## Security boundary

Do not put secrets in `NEXT_PUBLIC_*` variables. The browser must not be trusted to enforce roles or protect data. The frontend may use backend-provided identity/permission information to shape the interface, while the backend remains the enforcement point.

## Leadership task management

The leadership task pages consume the backend operations documented in `gdg-main-platform-backend/docs/leadership-tasks-openapi.yaml`. Group Leaders/Co-Leaders manage `/club-leadership/tasks`; the overall Developer Committees Leader manages `/developer-committees/tasks`; PM Leaders/Co-Leaders manage published PR event tasks under `/committees/PM/managed-events`. The backend validates target committee, active leadership role, event ownership/status, and caller permission on every request. Regular committee task boards display assigned cross-level tasks, while only the task's owning leadership scope can manage or review it.

The My Tasks dashboard's Members page loads the selected committee directory from `GET /my/committees/{committeeCode}/members`. The backend requires the caller's active membership in that committee and returns active members' limited directory fields. Loading, empty, retryable error, and unauthorized states are rendered by the frontend; no mock directory records are used when API mode is enabled.

## Profile badge status

`/profile` builds the member badge from the same `GET /me` response the page already loads:

| `/me` field | Badge use | Notes |
| --- | --- | --- |
| `fullName`, `university`, `profileImageUrl` | Name, chapter line, photo | No photo URL: the card shows a silhouette. |
| `gender` | Picks the silhouette | `"male"` in any case gets the male one; anything else, or nothing, the female one. |
| `committees[]` (`code`, `position`) | Committee colours and short name, role headline | Empty or missing: no badge. Several: the highest position wins. |

`lib/badge/themes.ts` is keyed by the committee codes the dashboards already use (`WEB`, `DATA`, `CYBER`, `AI`, `AUTOMATION`, `ROBOTICS`, `PR`, `CONTENT`, `PM`, `DMD`), and the badge localizes committee names, membership roles, and global roles in English and Arabic. Advisor badges use a white theme. `/me`'s exact position values beyond Member, Co-Leader, Leader, and Advisor remain `TBD` until the contract confirms them.

## PR registration dashboard status

The current backend schema contains no event or registration models, and the available NestJS controller exposes no registration operations. The PR dashboard therefore renders an honest empty registration state and does not invent applicant records, event questions, API routes, registration-open permissions, or backend authorization rules.

Before connecting this dashboard to production, the backend contract must define event listing/detail access, registration records and custom question answers, accept/reject/waitlist operations, and the applicable PR permissions. It must also define:

- confirmation message delivery and its authorization, plus confirmation status values;
- confirmation deadlines and expiry processing;
- how an applicant declines an accepted spot;
- ordered waitlist positions and server-side promotion of the first eligible applicant after a decline or expiry.

The frontend must not report a message as sent or promote waitlisted applicants itself. Registration open/close behavior remains **TBD** until an approved contract confirms it.

## Data committee guest reports

The backend contract for the Data dashboard exports is in `gdg-main-platform-backend/docs/data-event-reports-openapi.yaml`. The Data Leader and Co-Leader can list all non-draft events and request `all`, `going` (`CONFIRMED`), or `checked-in` (a recorded check-in) rows. Each row includes the attendee's answer to “Where did you hear about this event?”. The frontend downloads UTF-8 CSV files that Excel can open; authorization remains enforced by NestJS.
