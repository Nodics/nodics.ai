# commsApi

Employee inbox reads are available at `/employee/communications`, using Profile's
fresh own-identity proof and the original bearer, without a personal Customer
account. This shares existing inbox persistence and safe source projections.
See [Employee inbox identity](llm/contracts/README.md#employee-inbox-identity).

Secured Communication HTTP contract. This module follows the active `nodics.communication` ownership contract. Read `AGENTS.md` and `llm/contracts/README.md`; verify through focused tests and the effective server build.

Customer inbox reads retain the admitted customer's bearer for canonical Profile
identity resolution, never the runtime service credential. Strict generated-read
success and one matching customer are required before inbox/source reads. See
[customer inbox identity](llm/contracts/README.md#customer-inbox-identity).

Source-authorized service integrations may inspect an existing intent through
`POST /internal/communications/:intentCode/inspect` with body `{}`. Only
intentCode, persisted status and revision are returned; no delivery action occurs.
See [source-scoped inspection](llm/contracts/source-scoped-intent-authority.md#read-only-intent-inspection).

`acceptance:communication-source-delivery --execute` proves the Communication
owner path for a reviewed source binding: one durable delivery, exact replay
deduplication, suppression and one governed retry. Run the same command with
`--phase=inspect` after restarting Communication to prove persisted intent
inspection without another send. Projects contribute only stable scenario
selections under `tooling.acceptance.communicationSourceDelivery`; the signed
service bearer remains in `NODICS_COMMUNICATION_ACCEPTANCE_TOKEN`. Source-domain
eligibility is resolved through the normal configured source binding and is not
reimplemented by this module.

For retained uncertainty, the separate source-authorized
`POST /internal/communications/:intentCode/diagnostic` accepts exactly
`{sourceModule, sourceType, sourceCode}` and matches all three to the stored intent. It
returns a fixed safe classification from the exact latest persisted attempt.
It never sends, retries, contacts a provider or exposes private error/content.
See [static attempt diagnosis](llm/contracts/source-scoped-intent-authority.md#static-attempt-diagnosis).

Verification RPC authorizes the original private signed service request before
using Communication's existing runtime storage context. Group-free service JWTs
are not storage groups; caller claims and direct verifier policy stay unchanged.
See [the exact context contract](llm/contracts/private-internal-transport.md#exact-entry-and-owner-context).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

The native `POST /integrations/telegram/:receiverCode/start` route uses Telegram
webhook-secret authentication in the existing selectable parser chain, qualified
private admission and the existing raw JSON response contract. Its exposure and
receiver configuration remain disabled and empty by default. Read the
[inbound owner contract](../commsCore/llm/contracts/telegram-inbound-launch.md).
