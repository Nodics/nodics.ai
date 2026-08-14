# Customer Engagement Agent Contract

Follow the root Nodics AI agent contract before changing this boundary:

- root `README.md` explains the human/documentation route.
- Follow the repository agent contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated group boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

## Mandatory boundaries

- All new implementation belongs under `nodics.ai/nodics.engagement`; `local-archive` is read-only reference evidence.
- Keep the root group free of domain source and data. Runtime behavior belongs to the owning child capability.
- Keep Process, Profile, Media, Publish, WCMS, Search, Cache, Cron, BackOffice, Axis, and Communication authority in their owning modules.
- Do not use generated Customer Review or Notify residue under Core as source authority.
- Keep `engagementComms` one-way and fail-safe over the active `nodics.communication` source owner.
- Do not expose generic schema CRUD as a public Engagement API.
- Preserve tenant isolation, explicit permissions, secure anonymous-route policy, consent evidence, audit, idempotency, and retention/legal-hold boundaries when later phases add behavior.
- Regenerate derived artifacts from source definitions; never patch generated output directly.

## Phase discipline

Implemented phases may add only their approved schemas, routes, services, data, permissions, topology, tests, documentation, and generated evidence. Preserve the phase exit gates and update readiness evidence when contracts change.
