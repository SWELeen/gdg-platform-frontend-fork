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

`/profile` reads demo data (`data/demo-member.ts`) because no authenticated profile operation is published yet. The page gets everything from three values, so connecting it means replacing those imports with the signed-in member's data:

| Demo value | What the badge needs | Notes |
| --- | --- | --- |
| `demoMemberProfile` | Name, university and photo URL (plus the rest of the profile page's fields) | No photo URL: the card shows a silhouette. |
| `demoMemberGender` | `"female"` or `"male"` | Same values as the signup form. Picks the silhouette; anything else or nothing falls back to the female one. |
| `demoMembership` | Committee and role, or `null` for no committee | `null`: the page shows no badge. |

The committee must map to an id in `lib/badge/themes.ts` (for example `public-relations`, `web-development`), and the role must be Member, Co-Leader or Leader. If either doesn't match, or the name is missing, the badge shows an all-placeholder card ("Role", "Committee name", "Member name") on the default card instead of wrong data. Map backend values to these ids in one function where the response is read. The signup form also offers Advisor, which has no badge treatment yet (`TBD`). How the backend names committees and roles is `TBD` until the contract publishes them.

## PR registration dashboard status

The current backend schema contains no event or registration models, and the available NestJS controller exposes no registration operations. The PR dashboard therefore renders an honest empty registration state and does not invent applicant records, event questions, API routes, registration-open permissions, or backend authorization rules.

Before connecting this dashboard to production, the backend contract must define event listing/detail access, registration records and custom question answers, accept/reject/waitlist operations, and the applicable PR permissions. It must also define:

- confirmation message delivery and its authorization, plus confirmation status values;
- confirmation deadlines and expiry processing;
- how an applicant declines an accepted spot;
- ordered waitlist positions and server-side promotion of the first eligible applicant after a decline or expiry.

The frontend must not report a message as sent or promote waitlisted applicants itself. Registration open/close behavior remains **TBD** until an approved contract confirms it.
