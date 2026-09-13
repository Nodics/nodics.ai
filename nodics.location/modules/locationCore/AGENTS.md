# locationCore Agents

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Follow the root Nodics AI agent contract before changing this boundary:

- root `README.md` explains the human/documentation route.
- root `AGENTS.md` governs repository-wide AI and contributor behavior.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Location Core owns physical-place runtime validation and delegates storage to the generated `DefaultLocationService`. Keep the behavior layer in `DefaultLocationOperationService`; do not place validation directly in controllers or generated persistence services.

Reject direct `tenant` or `tenantCode` fields in Location business payloads. Use runtime tenant only as request/storage context, and use enterprise association fields when ownership or operator meaning is required.

Reject comma-separated coordinates and unlabeled coordinate arrays. Store `latitude` and `longitude` as separate numeric fields in that sequence.

Reject reusable Profile address fields in Location records. Use `addressRef` and contact references for Profile-owned address/contact authority.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
