# engagementApi

Secured public, customer, operator, projection, and integration API capability.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

## Capability status

This package implements the secured Engagement API foundation. Anonymous access is explicitly limited to active-form lookup and contact submission; customer, operator, and integration routes remain secured.

## Ownership

It owns secured public, authenticated-customer, operator, projection, and integration API boundaries plus DTO, policy, error, gateway-port, and facade mapping contracts.

It must not own domain persistence, lifecycle authority, provider delivery, Axis browser state, or generic schema CRUD exposure.

## Dependencies and extension

This capability depends on domain facades/services and engagementCore security contracts; it never reaches domain persistence directly. Customer and project customization belongs in later-loaded modules and layered configuration; archived CRES or gNotify files are reference evidence only.

## Verification

Verification covers route authentication metadata, tenant and customer ownership checks, service-token boundaries, payload/query limits, strict DTO allow-lists, safe errors, fail-closed missing domain adapters, and later-layer anonymous-policy override behavior.
