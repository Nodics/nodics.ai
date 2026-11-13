# Physical migration transport

Knowledge owns plan/employee/source authority; Projection owns native physical
commands; Publication owns original retirement and erasure receipts. Existing
public migration methods retain their business behavior and require the original
signed `authToken` from the authenticated request. They send no functions or
caller-supplied authorization claims to another owner.

`validateRetirementAuthority` is a fixed service-token-only evidence port. It
re-verifies the original token with the canonical authorization provider, denies
foreign tenants and non-employee access, rebuilds the canonical Copilot security
context, and repeats existing plan/source permission and fingerprint checks.
Current replacements require sealed, policy-current manifests, exact physical
counts, stable revisions and unchanged opaque model identities. The repeated
model read uses the descriptor's actual replica pins, never a guessed endpoint.

The framework default `copilot.knowledge.legacyMigration.authorityBinding`
selects this implementing module/service for an existing qualified index's
`retirement.authority`. Projection owns the common fixed-port defaults. Later
layers supply only genuine selection/context differences; no per-role module
inventory or parallel authority registry exists. Missing qualification rejects,
and migration/erasure enablement and plans remain disabled/empty by default.

Original credentials are transient request material only. Do not persist them,
place them in logs/errors/receipts, return them or send them to search providers.
Changing source policy, revoking a credential or changing model binding must
stop the command at the next fresh check; an already claimed uncertain operation
remains inspection-only. No retry, alias provider or live grants are enabled.

Run `copilotKnowledgeMigration.test.js` normally for local DMS, and with
`DISCOVERY_TEST_REMOTE=1` for JSON-only remote dispatch across isolated owner
contexts. Both use offline provider and journal fixtures. Native provider and
real deployment authorization qualification remain separate acceptance work.
