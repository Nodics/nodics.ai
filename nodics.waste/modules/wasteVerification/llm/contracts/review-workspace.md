# Review workspace and recovery

Workspace search applies current Profile operator scope and explicit denies before pagination and status counts. Canonical collection-point ownership outranks copied draft facts. Scalar filters, literal search and bounded pagination are validated server-side. Customer principals cannot enter the employee workspace. Backend presentation fields describe supported verified-fact inputs and labels.

Queue claim/release use exact revision and explicit idempotent commands. One employee cannot steal another assignment. Customer-confirmed facts remain immutable; independently recorded verified facts are audited. Entered verified weight is OPERATOR_MEASURED. Impact is refreshed through the owner profile/provider; unavailable refresh replaces earlier estimates with PENDING. Approval recalculates independently and retains the configured separate-approver rule.

Review command digest and persisted command protect approval/rejection recovery from changed replays. Recovery uses the original actor, decision, facts and idempotency identity. Mandatory rejection feedback remains customer-visible. Delivery recovery never reruns review or settlement. Communication owns uncertain delivery reconciliation; review exposes only scoped operations and delivery pointers.

Photo recognition is a versioned advisory contract. Only canonical taxonomy/material references are accepted, with observed/inferred provenance and bounded confidence. Unsupported, uncertain, blurry or multiple-item responses do not fabricate certainty. Image-only measured weight remains unknown; approximate weight/dimension ranges retain INFERRED provenance; handling size uses configured versioned item policies, otherwise UNKNOWN. Original Media evidence is retained. Illustrative impact is never presented as certified carbon credits.

## Business dashboard and rich corrections

The same scoped workspace serves Waste Operations, Electronics and Clothing.
Backend capabilities own view routes/families and presentation labels. Filters
include submission date range (UTC), family/category/item type, handling size,
channel, collection centre, area/city, status, assignment and literal search.
Counts and six time buckets run after current employee scope and filters, before
pagination. Charts display the bucket boundaries. Area labels come from the
Location/Profile projection; unavailable area enrichment fails an area query
rather than silently returning misleading counts.

Reviewers use canonical taxonomy/material selections and bounded physical and
environmental corrections. Verification refreshes impact and retains original
customer facts. Approved/rejected detail uses the same descriptor projected for
the customer, including exact public review feedback. Photos, quantities,
classification, provenance and approved impact remain available on the asset.
Image-derived ranges are approximate; measured weight is a separate field.

## Mandatory manual approval for image-source concerns

Persisted `metadata.evidenceReview` holds cannot be cleared by request payload,
verification corrections, approval, reanalysis or photo replacement. The
`assertEvidenceReview` owner guard prevents service/non-human actors from
processing flagged or unassessed evidence even if a future access adapter
allows automated review of other records. Future automation must call these
owner operations and respect the canonical evidence projection; UI badges are
not the enforcement boundary. Current operational access remains human-only.

A human APPROVED command for flagged evidence requires `evidenceReviewed: true`
in addition to existing permission, scope, verification, revision and final
confirmation gates. Axis asks for an unchecked, record-specific acknowledgement
inside the approval dialog. Rejection remains available without this approval
acknowledgement. A combined-role user can still verify and approve subject to
the existing explicit separation policy.

Ordinary rejection without approval acknowledgement does not mean rejection without
verification. When `waste.operations.requireVerification` is enabled, ordinary
APPROVED and REJECTED require the prior verification reference. An administrator,
assignment, public rejection reason or `evidenceReviewed: true` does not waive
that requirement. Do not attest physical condition, measured weight or custody
from illustrative artwork merely to unlock a final decision. The separate
evidence-only command below can reject unusable evidence without making those claims.

`CHANGES_REQUESTED` is a generic lifecycle/schema value, not an implemented
persisted review command in this workspace. The internal lifecycle transition
helper returns a transformed model; it does not provide an audited reviewer
correction request, customer notification or customer resubmission workflow.
Do not use direct status updates or that helper to bypass review policy.

### Evidence-only rejection

`DefaultWasteVerificationOperationService.rejectEvidence` delegates to
`DefaultWasteEvidenceRejectionService.reject`. It is a distinct operation, not a
flag on ordinary review and not a reduction of `requireVerification`.
Admission requires an authenticated human with existing `waste.review.approve`,
current Profile record scope and explicit ownership of the review assignment.
Only active SUBMITTED/UNDER_REVIEW records with original photo evidence and no
verification/approval/asset/receipt/impact references qualify. Bounded owner reads
also exclude any persisted source-linked asset, including inactive assets, or
earlier verification/decision record. Missing owner reads fail closed.

Input is a nonblank public reason (at most 1000 characters), exact expected
revision, explicit confirmation and bounded idempotency key. Payloads cannot
supply verified facts, approval acknowledgement, replacement media or lifecycle
state. An immutable fingerprint pins the original actor, tenant, source revision,
reason and original evidence/customer facts. The compare-and-set submission
checkpoint fences conflicting review commands before audit persistence.

The existing `wasteVerification` schema stores a REJECTED decision audit with
`metadata.reviewBasis: EVIDENCE_ONLY`. Its required `verifiedBy`/`verifiedAt`
fields identify the decision actor/time, not a physical verification event.
No VERIFIED row, verified facts, pre-approval verification reference, approval
acknowledgement or approved-by claim is created. Submission `reviewedBy`,
`reviewedAt`, `publicReason` and decision reference describe the rejection.
Original photo, Media references, customer facts and evidence holds are retained.
No asset, custody, impact assessment, Rules evaluation or reward effect occurs.

Exact completed replay is read-only. Changed actor/reason/key/evidence or another
audit conflicts. Interrupted audit/completion can resume through existing review
recovery only with the original recorded command and assigned actor. Recovery
dispatches to the evidence-only owner; ordinary review refuses its checkpoint.
This is not a correction/resubmission workflow and does not establish that a
physical item was inspected. Approval still uses all normal verification gates.

Fresh workspace detail advertises `evidenceRejectionAvailable` only for an
assigned human with current approval grant, matching Profile scope, eligible
state and bounded absence of source-linked assets and prior decisions. Failed
owner reads withhold the action. Queue/assignment projections default false;
consumers must load detail. Axis also requires current approval grant, assignment
and owner labels; execution repeats every guard. Advisory submission assessment
is `metadata.estimate`, which remains unchanged. A physical `impactRef` or verified
estimate remains ineligible. The existing
`waste.reviewWorkspace.labels` supplies evidenceReject, evidenceRejectTitle,
evidenceRejectExplanation, evidenceRejectSaved and evidenceRejectBasis. Partners
customize copy through later configuration layers, never by removing admission.
Role tests use real Profile scope and permission behavior. The dedicated rejection
suite covers denial, immutable evidence, original-command recovery, owner outages,
replay and absence of physical/financial writes. Consumer/native acceptance remains
separate from these isolated tests.

Acknowledgement is part of the immutable decision digest and recovery command.
`manualEvidenceApproval` records the authenticated employee, timestamp, current
photo, first flagged photo, reason codes and command identity. Approved assets
retain the evidence hold and manual approval audit. Recovery reuses the saved
acknowledgement; service actors cannot use recovery to bypass manual routing.

## Recorded Decision Recovery

### Verification checkpoint

Verification computes its advisory estimate read-only, then CAS-claims the source
revision with `metadata.verificationPending` before writing any VERIFIED audit.
The checkpoint freezes original actor, command digest/key/revision, audit identity,
facts, estimate and time. Evidence rejection, normal decision and assignment
changes refuse a pending verification. Competing verification/rejection commands
therefore cannot leave a VERIFIED audit attached to an evidence-only rejection.

Only the assigned original verifier with current permission/scope can complete
the checkpoint. Exact original replay or explicit `resumeVerification:true` with
current expected revision and confirmation reuses the original audit and facts;
the latter accepts no replacement facts. Final CAS removes the checkpoint, binds
the verified evidence and returns the submission to the queue. Success advances
the source twice; consumers use returned revisions rather than assuming +1.
An audit or completion outage retains recoverable original state, never permission
to reject, reassign or assess different facts. There are no asset/custody/reward
effects. The safe detail projection exposes only original principal and frozen
facts; command keys/digest stay private. Axis renders read-only inputs and a resume
action owned by `waste.operations.presentation.resumeVerificationAction`.
Later-layer copy overrides do not alter original-actor or CAS requirements.
`wasteVerificationConcurrency.test.js` covers both competing orderings and audit/
completion failure recovery with isolated persistence; no native mutation is implied.

An unchanged completed decision replay returns `replayed: true` without creating a
new decision. Composing accelerators use this marker to preserve original reward
evidence rather than evaluating a replacement policy. Permission, scope, immutable
command digest and evidence acknowledgement gates still apply to replay.

Authorized submission projection may expose a top-level `reviewDiagnostic` with
bounded registered code, REWARD_ASSESSMENT/REWARD_SETTLEMENT stage, static status
owner message and boolean `retryAllowed`. Unknown status codes are omitted. Source
messages/causes and reward ledger/assessment contents are not copied into this
projection. The diagnostic is not an authorization or a separate lifecycle.

`metadata.outcomeDelivery` is also reconstructed, never forwarded wholesale.
Only bounded canonical intent/status/revision/attempt/retry-time fields survive.
Known outcome diagnostics resolve both nested and top-level messages from the
registered status owner without an accelerator-prefix restriction. Unknown codes/stages, source messages, causes, recipient
data, correlation keys and extra fields are omitted without mutating the source.

Completed review DTOs additionally expose top-level
`outcomeNotification: {status, message?, retryAllowed}`. This is read-only
presentation, not a delivery ledger or a persisted state. A historical completed
record with no original bounded review command key and no recorded intent is
`NOT_ESTABLISHED` with `retryAllowed:false`; APPROVED/REJECTED alone never implies
PENDING, a communication intent or permission to resend. Original key/decision
records are not backfilled. Genuine bounded intent status remains visible even
when retry authority is missing. Completed review facts/revision remain intact.

The existing notification operation requires the original review key. With that
key, absence of delivery may allow explicit original-command recovery but still
does not claim PENDING. Only recorded PENDING/ACCEPTED/RETRY_PENDING/DELIVERING
states advertise retry; terminal/uncertain or malformed delivery does not. This
includes canonical `UNCONFIGURED`, which remains visible without becoming
NOT_ESTABLISHED or retryable. Axis retains this owner status unchanged. The
flag grants no permission and never bypasses current scope or Communication
admission. UNCERTAIN keeps its separate owner reconciliation, never automatic
retry. Presentation must not fall back from a missing summary to PENDING/Retry.

The existing `waste.reviewWorkspace.labels` map owns `outcomeNotification`,
`outcomeRetry`, `outcomeNotEstablished` and `outcomeReviewAuthorityMissing`.
The projection supplies bounded configured explanatory text, not raw metadata
messages, private keys or frontend-authored domain copy. Axis consumes the
summary/status/message and gates Retry on `retryAllowed === true`. Source tests
cover historical approved/rejected records, real retry refusal with zero
dispatch/writes, known delivery preservation, invalid evidence and later-layer
copy. Frontend adoption must separately remove its absent-delivery PENDING and
local retry blacklist; backend source qualification is not UI acceptance.

## Explicit reviewer responsibility

### Saved approved asset

`DefaultWasteVerificationOperationService.approvedAsset` is a read-only helper
for an already-authorized approved submission. Completed approval replay and
eWaste settlement retry share it. It queries the existing generated Waste owner
for `sourceSubmissionCode` with a maximum of two results, requires exactly one
asset, and independently reads the exact saved `verificationRef`. The asset and
approved verification must both belong to that submission; explicit tenant
aliases must match the original authenticated tenant. Missing, inactive,
ambiguous, mismatched or foreign evidence fails before settlement or writes.
Rejected review replay returns no asset and does not perform an asset lookup.

The identity is persisted evidence, not `WASTE_ASSET_` plus a submission code.
Creation may normalize punctuation, use a policy prefix or accept a requested
identity. Neither current creation policy nor a caller-supplied candidate may
reconstruct or replace the saved identity during replay. This change creates no
asset, approval, reward or migration and does not repair missing historical
verification. Original assessment/settlement guards and idempotency stay intact.

Opening detail is read-only. An authenticated employee must successfully CLAIM the submission before editing verified properties or recording verification/approval/rejection. The existing assignment record is the single authority; `assertAssignment(..., true)` denies unclaimed/queue records with `ERR_WASTE_ASSIGNMENT_REQUIRED` and preserves conflict rejection for another employee. Permission, scope, exact revision, human evidence checks and final confirmation still apply. Claim itself does not verify evidence or approve the item.

Axis keeps assignment state and the claim/release action in the non-scrolling dialog header. It enables fields only from a confirmed owner response, keeps pending/failed claims read-only, and requires local changes to be saved or discarded before release. Release leaves the submission UNDER_REVIEW and returns it to the queue. Verification also hands off to the queue; the next reviewer, including a combined-role employee, claims before making a new decision. Separate-approver policy remains explicit. Completed verification replay remains idempotent after handoff; recorded decision recovery and final settlement recovery do not create a new review decision.

The existing `waste.reviewWorkspace.labels` map supplies assignment guidance, pending/success states and completed/read-only copy. Partners override individual labels through their own layered configuration, without copying the entire map or weakening owner checks. Focused workspace/role and Axis tests cover unclaimed denial without writes, claim/release ownership, post-verification handoff, unchanged retry and failed claim presentation.
