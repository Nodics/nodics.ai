# wasteVerification Agents

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

`wasteVerification` owns reviewer decisions and verified facts. It must preserve
submitted facts and keep public reasons separate from internal notes.

Review views are keyed contributions owned by their publishing module. This generic module supplies no accelerator-specific labels or family filters. Enforce declared fixed filters before querying and retain Profile scope independently.

Review and approval are independent permissions. Do not infer approval denial from the actor having verified the same record. Users granted both may perform both actions; preserve distinct verification and decision audit evidence. Separate actors are required only by an explicitly enabled project policy.

Flagged image evidence must follow manual approval. Preserve the server-owned
evidence hold on submissions and assets, require an authenticated human and
explicit evidence acknowledgement for approval, and audit it. Future automation
must pass the same owner guard; payload flags cannot waive this requirement.

New verification and review decisions require the authenticated employee to own the explicit review assignment. Preserve queue claim/release, revision conflicts and idempotent completed replay; never infer responsibility from opening a detail view or from permission alone. Keep assignment guidance configurable in the existing reviewWorkspace labels.
