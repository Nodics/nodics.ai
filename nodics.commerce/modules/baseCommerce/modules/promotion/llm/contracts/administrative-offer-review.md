# Native Administrative Offer Review

Promotion permits a native Profile Platform administrator to review and approve
an exact issuer's Staged offer within the authenticated tenant. This is business
target selection, not Enterprise membership, a staff grant or impersonation.
No customer configuration or permission definition is required. Existing ordinary
issuer review remains unchanged. `adminGroup` alone is not native Platform proof.

## Axis Contract

Routes are under Promotion v0 and use the unchanged administrator bearer and
default Platform context. Never send the target as an enterprise header or claim.

1. POST `/promotions/administrative-review/capabilities`, body `{}`. Successful
   data contains `contractVersion:1`, `crossEnterpriseReview:true`, owner `labels`,
   and `review:{method:"POST",route:"/promotions/:promotionCode/administrative-review",targetField:"issuerEnterpriseCode"}`.
   Refusal means unavailable; do not infer this capability from a role name.
2. POST `/promotions/:promotionCode/administrative-review`, body
   `{issuerEnterpriseCode}`. The exact target is resolved through Profile's
   existing same-tenant participant directory, not inferred from offer names.
   Data contains code/name/status/priority/dates/versionId/revision, target
   issuerEnterpriseCode, available actions/conditions/couponOffer/budget,
   issuer/vendor references, safe approval metadata and `lifecycleActions`.
3. Each available approval action has `actionCode:"APPROVE"`, `labelKey:"approve"`,
   `method:"POST"`, exact `/promotions/<code>/administrative-approve` route,
   issuerEnterpriseCode, expectedVersionId and expectedRevision. Submit those
   three body fields plus a nonempty reasonCode (maximum 512 characters).
   Success returns `{promotion:<ordinary versioned projection>}`. Re-read the
   same target to obtain the new status/version and audit.

Owner labels are administrativeReview, issuerEnterpriseCode, reviewOffer, approve,
reasonCode and confirmApproval. Use the existing Profile directory for permitted
target lookup, never an unscoped private Enterprise inventory. Changing issuer or
offer clears review state, pending confirmation and outstanding UI requests.
Confirm target, offer and reason before dispatch. Clients never choose status.

The safe approval projection includes submittedBy/At, approvedBy/At, lastAction,
lastActionBy/At, reasonCode and administrativeReview. The latter records tenant,
original actorCode, actorEnterpriseCode, target issuerEnterpriseCode, permission
and authVersion. Tokens and proof nonces are neither returned nor persisted.

## Admission And Persistence

Profile owns fresh nonce-bound native human PASSWORD access proof, configured
default tenant/Enterprise, direct persisted reserved Platform group, current
Employee/stamp, active permission and final revalidation. Promotion compares
nonce, actor, tenant, original Enterprise, permission and authVersion exactly.
The target is an active Enterprise belonging to that same tenant. There is no
cross-tenant override, cached proof, runtime credential or service impersonation.

Promotion's framework administrativeReview properties own transport defaults.
Profile admits the existing `commerce.promotion.approve` vocabulary in its proof
allowlist; this is not a grant to anyone. Missing or narrowed configuration fails
closed. Original request, target, transport and policy are pinned across awaits.
Fresh proof and target resolution run before reads and again immediately before
the qualified generated write. This is not a distributed lock against Profile
revocation after the final check.

The same private draft writer checks CURRENT source qualification, exact issuer,
version and revision, unchanged immutable terms/budget and successor readback.
Existing maker-checker policy applies to the actual native administrator actor.
Only SUBMITTED to APPROVED is exposed. No generic CRUD, draft creation, activation,
publication decision, seller consent, budget admission or issuance is granted.

## Failures And Verification

Reject stale versions, self-approval, non-native/broad admin, inactive/foreign
targets, mismatched nonce/actor/authVersion/permission, mutated inputs, changed
authority or unqualified storage. Unknown write outcomes require exact target
readback, never automatic retry, replacement offers or source import replay.
An empty action list is a legitimate non-actionable reviewed state.

`promotionDraftContract.test.js` exercises the actual generated/versioned writer
over an isolated driver and covers original ownership/audit, stale attempts,
maker-checker, target/proof mismatch and prewrite revocation. Profile's
`profilePlatformAdministratorEvidence.test.js` composes the actual Promotion
consumer with its native proof and same-tenant directory and tests adminGroup-only,
foreign/inactive target and stamp rejection. Later-layer narrowing must preserve
these boundaries. These tests are source contracts, not live approval or E2E proof.
