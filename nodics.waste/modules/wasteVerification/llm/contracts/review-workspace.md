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

Acknowledgement is part of the immutable decision digest and recovery command.
`manualEvidenceApproval` records the authenticated employee, timestamp, current
photo, first flagged photo, reason codes and command identity. Approved assets
retain the evidence hold and manual approval audit. Recovery reuses the saved
acknowledgement; service actors cannot use recovery to bypass manual routing.

## Explicit reviewer responsibility

Opening detail is read-only. An authenticated employee must successfully CLAIM the submission before editing verified properties or recording verification/approval/rejection. The existing assignment record is the single authority; `assertAssignment(..., true)` denies unclaimed/queue records with `ERR_WASTE_ASSIGNMENT_REQUIRED` and preserves conflict rejection for another employee. Permission, scope, exact revision, human evidence checks and final confirmation still apply. Claim itself does not verify evidence or approve the item.

Axis keeps assignment state and the claim/release action in the non-scrolling dialog header. It enables fields only from a confirmed owner response, keeps pending/failed claims read-only, and requires local changes to be saved or discarded before release. Release leaves the submission UNDER_REVIEW and returns it to the queue. Verification also hands off to the queue; the next reviewer, including a combined-role employee, claims before making a new decision. Separate-approver policy remains explicit. Completed verification replay remains idempotent after handoff; recorded decision recovery and final settlement recovery do not create a new review decision.

The existing `waste.reviewWorkspace.labels` map supplies assignment guidance, pending/success states and completed/read-only copy. Partners override individual labels through their own layered configuration, without copying the entire map or weakening owner checks. Focused workspace/role and Axis tests cover unclaimed denial without writes, claim/release ownership, post-verification handoff, unchanged retry and failed claim presentation.
