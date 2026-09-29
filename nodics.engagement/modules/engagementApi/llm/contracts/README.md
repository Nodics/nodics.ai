# engagementApi Contracts

## Canonical Journey Acceptance

The capability-owned journey requires literal `execute: true` (CLI: `--execute`);
imports and help perform no operations. Verify RECEIVED intake with a nonnegative
safe-integer revision, correlated operator lookup and all five transitions:
TRIAGE to TRIAGED, ASSIGN to ASSIGNED, START to IN_PROGRESS, RESOLVE to RESOLVED
and CONFIRM to CLOSED. Each response must identify the submitted record, reach
the expected status and advance its numeric revision. A successful HTTP response
or revision increment alone is insufficient. Public testimonials and review items
must retain their array contracts. Denials and invalid evidence stop the journey.

Run `node --test nodics.engagement/modules/engagementApi/test/engagementJourneyAcceptance.test.mjs`
from the framework root. Fixtures use injected transport and independent deployment
names; customer activation and live journey evidence remain customer-owned.

## API capability contract

- Status: secured foundation implemented; domain experiences remain inactive.
- Owns: secured public, authenticated-customer, operator, projection, and integration API boundaries plus DTO and facade mapping contracts.
- Prohibits: domain persistence, lifecycle authority, provider delivery, Axis browser state, or generic schema CRUD exposure.
- Dependency boundary: domain facades/services and engagementCore security contracts; it never reaches domain persistence directly.
- Archived sources are read-only migration evidence and never current authority.
- Later layers customize through governed configuration and loader-visible overrides without editing this framework package.
- Security, tenant isolation, audit, failure/recovery, and generated-artifact tests are mandatory when implementation begins.
- Every route is secured by default unless an owning domain phase explicitly allow-lists the exact anonymous operation; all routes carry access, permission, and exposure metadata.
- Anonymous access requires both a reviewed route override and the exact operation in `anonymousRouteAllowList`.
- Customer reads enforce owner and tenant; operator reads enforce tenant; integration callbacks require a service token and service-account group.
- Facades use the domain gateway port and never call schema services or repositories directly.
- DTO projections are field allow-lists; raw payload, request hash, risk evidence, credentials, stacks, and provider responses remain excluded.
- Missing domain implementations fail closed with `ERR_ENG_API_00005`.
