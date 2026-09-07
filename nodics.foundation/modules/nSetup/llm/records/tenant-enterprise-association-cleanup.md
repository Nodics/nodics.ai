# Tenant And Enterprise Association Cleanup

## Recorded Action

Audit existing framework and domain schemas for fields that use tenant as business ownership or business association. Tenant remains the runtime, security, persistence, and isolation boundary. Business ownership, platform ownership, operators, vendors, issuers, asset owners, and partners must be represented through Profile Enterprise associations unless a direct tenant field is required by a framework envelope, generated persistence contract, or runtime security boundary.

## Scope

- Replace business-meaning tenant references with role-aware enterprise references where the schema owns business state.
- Keep tenant fields where they are technical runtime scope, generated persistence scope, token validation scope, or import/export isolation scope.
- Update migrations, data releases, Axis forms, API filters, and tests together for every affected module.
- Do not remove a tenant field locally when downstream services still require it for runtime isolation.

## Status

Implemented as a framework and focused Commerce cleanup gate. Durable nSetup guidance now treats tenant as runtime isolation/data placement only, Commerce marketplace guidance now requires role-aware Profile Enterprise associations for persisted business relationships, and the enterprise association principle contract verifies the rule against Store, Promotion, Location, and Waste schemas.

Retained direct `tenant` fields remain technical schema-policy, generated persistence, operational evidence, import/export, security, or runtime-governance scope. Transitional scalar `enterpriseCode` paths may remain only as request/header/token compatibility context while owning modules migrate callers to role-aware enterprise association fields.
