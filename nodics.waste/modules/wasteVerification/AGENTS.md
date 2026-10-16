# wasteVerification Agents

Review presentation resolves Waste Material's descriptor vocabulary in
`DefaultWasteReviewWorkspaceService.presentation`, not by importing implementation
files from properties. Preserve explicit layered presentation overrides and the
Axis response shape; a preview remains independent of verification or approval.

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

`wasteVerification` owns reviewer decisions and verified facts. It must preserve
submitted facts and keep public reasons separate from internal notes.

Persist the revision-fenced `verificationPending` command before any VERIFIED
audit. Rejection, ordinary decision and reassignment must refuse that checkpoint.
Only the assigned original verifier may resume its frozen facts and assessment;
never recalculate or permit replacement facts during recovery. Cover both
verification/rejection interleavings and interrupted audit/completion writes.

Review views are keyed contributions owned by their publishing module. This generic module supplies no accelerator-specific labels or family filters. Enforce declared fixed filters before querying and retain Profile scope independently.

Review and approval are independent permissions. Do not infer approval denial from the actor having verified the same record. Users granted both may perform both actions; preserve distinct verification and decision audit evidence. Separate actors are required only by an explicitly enabled project policy.

Flagged image evidence must follow manual approval. Preserve the server-owned
evidence hold on submissions and assets, require an authenticated human and
explicit evidence acknowledgement for approval, and audit it. Future automation
must pass the same owner guard; payload flags cannot waive this requirement.

With `requireVerification` enabled, ordinary rejection also requires prior
verification; acknowledgement never substitutes for physical facts. Use the
dedicated `DefaultWasteEvidenceRejectionService` for unusable, unverified image
evidence. It requires the existing rejection grant, scoped assigned human, exact
revision/key/reason, and bounded absence of any asset or earlier verification.
Preserve its EVIDENCE_ONLY audit, original facts/media, conflict/recovery checks
and zero asset/custody/impact/reward effects. Never route it through normal
approval. `CHANGES_REQUESTED` remains unsupported. See the review-workspace contract.

New verification and review decisions require the authenticated employee to own the explicit review assignment. Preserve queue claim/release, revision conflicts and idempotent completed replay; never infer responsibility from opening a detail view or from permission alone. Keep assignment guidance configurable in the existing reviewWorkspace labels.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Completed status alone is not notification authority. Project the owner-derived
`outcomeNotification` summary and configured reviewWorkspace copy; missing
historical review command/delivery evidence is NOT_ESTABLISHED, never inferred
PENDING or retryable. Preserve genuine recorded delivery and uncertain outcomes,
do not expose review keys or backfill sample records, and keep completed reviews
read-only. Consumers must use the owner retry flag rather than inventing it from
absent metadata. See the review-workspace contract and HTTP/owner regressions.
`UNCONFIGURED` is genuine owner evidence, not NOT_ESTABLISHED or retry authority.

Approved-review replay and settlement continuation resolve the saved asset through
`approvedAsset`, using `sourceSubmissionCode` and the exact saved approved
verification. Never rebuild an asset code from a prefix, current creation policy
or caller candidate. Preserve bounded unique-result, source/verification and
tenant checks before settlement; rejected replay has no asset. See the saved
approved-asset section of the review-workspace contract.
