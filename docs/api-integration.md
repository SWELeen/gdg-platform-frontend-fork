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

The technical guide shows the frontend running at `http://localhost:3000` and the backend API at `http://localhost:3001`, with `NEXT_PUBLIC_API_URL` pointing to the API. Treat these as initial local-development guidance. The final local ports and all non-local base URLs must be confirmed in the repositories’ environment templates.

## Security boundary

Do not put secrets in `NEXT_PUBLIC_*` variables. The browser must not be trusted to enforce roles or protect data. The frontend may use backend-provided identity/permission information to shape the interface, while the backend remains the enforcement point.

## Profile badge status

`/profile` builds the member badge from the same `GET /me` response the page already loads:

| `/me` field | Badge use | Notes |
| --- | --- | --- |
| `fullName`, `university`, `profileImageUrl` | Name, chapter line, photo | No photo URL: the card shows a silhouette. |
| `gender` | Picks the silhouette | `"male"` in any case gets the male one; anything else, or nothing, the female one. |
| `committees[]` (`code`, `position`) | Committee colours and short name, role headline | Empty or missing: no badge. Several: the highest position wins. |

`lib/badge/themes.ts` is keyed by the committee codes the dashboards already use (`WEB`, `DATA`, `CYBER`, `AI`, `AUTOMATION`, `ROBOTICS`, `PR`, `CONTENT`, `PM`, `DMD`), and the badge knows the positions Member, Co-Leader and Leader. If the code or position doesn't match, or the name is missing, the badge shows an all-placeholder card ("Role", "Committee name", "Member name") on the default card instead of wrong data. `/me`'s exact position values beyond Leader and Co-Leader, and positions such as Advisor, are `TBD` until the contract confirms them.

## PR registration dashboard status

The current backend schema contains no event or registration models, and the available NestJS controller exposes no registration operations. The PR dashboard therefore renders an honest empty registration state and does not invent applicant records, event questions, API routes, registration-open permissions, or backend authorization rules.

Before connecting this dashboard to production, the backend contract must define event listing/detail access, registration records and custom question answers, accept/reject/waitlist operations, and the applicable PR permissions. It must also define:

- confirmation message delivery and its authorization, plus confirmation status values;
- confirmation deadlines and expiry processing;
- how an applicant declines an accepted spot;
- ordered waitlist positions and server-side promotion of the first eligible applicant after a decline or expiry.

The frontend must not report a message as sent or promote waitlisted applicants itself. Registration open/close behavior remains **TBD** until an approved contract confirms it.
