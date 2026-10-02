# commsApi

Secured Communication HTTP contract. This module follows the active `nodics.communication` ownership contract. Read `AGENTS.md` and `llm/contracts/README.md`; verify through focused tests and the effective server build.

Source-authorized service integrations may inspect an existing intent through
`POST /internal/communications/:intentCode/inspect` with body `{}`. Only
intentCode, persisted status and revision are returned; no delivery action occurs.
See [source-scoped inspection](llm/contracts/source-scoped-intent-authority.md#read-only-intent-inspection).

Verification RPC authorizes the original private signed service request before
using Communication's existing runtime storage context. Group-free service JWTs
are not storage groups; caller claims and direct verifier policy stay unchanged.
See [the exact context contract](llm/contracts/private-internal-transport.md#exact-entry-and-owner-context).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
