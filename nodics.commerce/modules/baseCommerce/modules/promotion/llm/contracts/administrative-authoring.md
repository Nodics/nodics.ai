# Governed Administrative Authoring

The existing native Platform Admin may author an explicitly selected same-tenant
issuer without another issuer profile or grant. This is a separate administrative
transport, not a relaxation of ordinary signed-enterprise scope.

## Commands

All endpoints are POST under `/nodics/promotion/v0/business/promotions/administrative/`.
Every body is exactly `{issuerEnterpriseCode, command}`. Original signed tenant,
Platform enterprise, bearer and human actor remain unchanged. Never send the
issuer as an enterprise header or replace signed claims.

| Suffix | Command | Fresh Profile Permission |
| --- | --- | --- |
| `read` | `{code}` | `commerce.promotion.read` |
| `create` | Existing Promotion draft creation body | `commerce.promotion.draft.write`; coupon offers also require `commerce.promotion.manage` |
| `update` | `{query:{code,versionId},model,options?}` using existing DRAFT metadata fields | `commerce.promotion.draft.write` |
| `submit` | `{code,expectedVersionId,expectedRevision,reasonCode}` | `commerce.promotion.manage` |
| `schedule` | Same lifecycle preconditions | `commerce.promotion.manage` |

Responses identify `issuerEnterpriseCode`, project `promotion`, and include
non-secret actor/target/permission audit. Reads return one current campaign's
policy and approval details, never coupon secrets or seller authorizations.
Creation remains inert DRAFT; updates cannot rewrite immutable coupon terms.

## Admission And Gates

`DefaultPromotionAdministrativeReviewService` reuses its configured
`promotion.administrativeReview` Profile target, evidence/recipient paths and
timeout. Nonce-bound native proof validates the current persisted administrator,
permission and authVersion. Exact enterprise resolution proves the same-tenant
target. Configuration admits proof requests, never grants business authority.
Unavailable, stale, conflicting or mutated evidence fails closed.

`DefaultPromotionDraftService` uses the same grammar, qualified CURRENT Staged
storage, generated versioned persistence, private admission, exact acknowledgement
and readback as ordinary commands. It revalidates proof before writes and retains
the original Admin in created/updated/submitted actor fields and administrative
audit. No public flag, copied request or alternate header mints admission.

Approval remains on the existing administrative-review/administrative-approve
endpoints. The same actor cannot approve its own submission. Scheduling requires
independently approved policy and preserves the existing lifecycle/date rules.
This capability does not publish policy, admit budgets, grant seller consent,
issue stock, make payments or authorize runtime adoption. Those owner gates remain
independent; do not infer end-to-end acceptance from authoring success.

## Verification

Run focused `promotionDraftContract.test.js` and
`profile/test/profilePlatformAdministratorEvidence.test.js`. Promotion covers the
real generated/versioned writer over isolated driver I/O, retained identity,
read/create/update/submit/schedule, current-version conflicts, forged scope,
authority drift and maker-checker. Profile verifies fresh persisted proof and
rejects missing/inactive permissions and non-native administrator identity.
These tests are source evidence, not installed Local workflow acceptance.
