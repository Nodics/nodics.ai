# Material Value Assessment and Release

## Configuration Ranges

Owner properties define `wasteMaterialValue.validation`: decimal digits 1..100,
operational limits 1..100000, Profile/provider/Loyalty timeouts 1..100000ms,
amount scale 0..8 and rational-term digits 1..30. These ranges are consumed by
assessment, exact-amount/rational checks and participant read admission; no
service supplies replacement ceilings. Existing exact Loyalty precision checks
remain independently authoritative. Partial intentional overrides inherit the
remaining framework defaults; null/malformed objects, invalid values and
inverted ranges refuse. Business rates, shares, programs and evidence stay in
governed records. `materialConfiguration.test.js` tests this source-only contract.

Waste Reward now owns the narrow release coordinator under the explicitly authorized framework-maintainer extension. Loyalty remains sole reward admission, wallet and ledger authority. No recycler payment is executed here and no independent spendable balance exists. Participation reward evidence stays separate.

## APIs and authority

POST /waste/material-value/assessments takes {evidenceRef}; POST /waste/material-value/releases takes {batchCode, allocationCode, paymentEvidenceRef}; POST /waste/material-value/lookup takes {batchCode}. These remain service-only with the respective waste.materialValue.assess/release/read permission. Controllers preserve trusted authData; facades delegate to the effective loader services. An upstream business application must authorize its human actor and operational scope through Profile before internal mutation calls. Body tenant/provider/paid assertions grant nothing. Owner permission definitions are module data; Profile owns assignments. No implicit Super Admin financial bypass.

POST /waste/material-value/allocations is also available to access-token customers and employees with waste.materialValue.read. Browser input is {page?}; optional ownerRef must exactly match current Profile evidence. Service callers must supply {ownerRef,page?}. DefaultWasteMaterialValueReadAccessService forwards the unchanged signed bearer and Enterprise context to Profile /customer/identity or /identity/scopes/me. Customer identity is the canonical returned code, not loginId. Employees additionally need Profile profile.scope.read plus a matching tenant/Enterprise scope and no matching deny; capability restrictions match waste or wasteReward. Parent/hierarchy and business-unit scopes alone are insufficient. Original customer/Enterprise ownership is independent of the employee and current certificate holder.

The response is {data:{ownerRef,items,total,page,limit,source:'PERSISTED_ASSESSMENTS'}}. Each item has batchCode, sourceLabel:'Material value', currency/currencyScale, rewardScale, synthetic, valuationRef, policyRef, programCode/rewardTypeCode and only the owner's allocations. Allocation fields include code, contributionRef, receiptRef, attributedValue, beneficiaryValue, rewardAmount, status, paymentStatus, paymentRef, ledgerRef and completedAt. Status progresses AWAITING_PAYMENT to CREDIT_PENDING to COMPLETED; paymentStatus is NOT_CONFIRMED until a qualified frozen release exists, then CONFIRMED. A CREDIT_PENDING outcome may already have posted in Loyalty but lack reconciled acknowledgement. Never infer spendable value here: spendableHere is always false and Loyalty remains the balance authority. Other beneficiaries, batch payer/payee and raw financial evidence are not projected.

Paths are relative to the deployed wasteReward API mount. wasteMaterialValueRead exposure is separate from internal commands; the allocation route is sensitive, uncached and sends Cache-Control: no-store. Profile transport definitions and complete defaults live in wasteMaterialValue.profile in config/properties.js. Invalid transport settings, stale/mismatched identity, conflicting scope, failed nested responses and authority drift reject before domain reads. No new permission definitions, shared group composition or grant assignments are necessary for these routes; the parent must select existing grants and Profile scope access in its governed deployment.

DefaultWasteMaterialValueAssessmentService persists wasteMaterialValueBatch and original-contribution claims through generated repositories. DefaultWasteMaterialValueSettlementService persists one release per allocation in the same batch with optimistic CAS. Shared group composition is unchanged; wasteReward already participates in Waste. Standalone deployments need Waste Core persistence/repositories and configured Loyalty remote authority. API exposure is owner-configured; deployment and provider qualification remain separate.

## Qualified valuation adapter

CONFIG wasteMaterialValue.evidence.valuationProviderService selects a loader service implementing readValuation({evidenceRef}, {tenant, qualificationRef, signal}). Defaults are null and fail unavailable. The adapter must authorize and resolve actual responsible-partner confirmed evidence and program terms, not accept a document/string/checkbox as confirmation.

Return {status: 'CONFIRMED', synthetic: boolean, valuationRef, batchRef, payerRef, payeeRef, confirmationRef, currency, confirmedValue, policyRef, contributions}. All references have module/schema/code. policyRef must reference wasteReward/wasteMaterialValuePolicy, an ACTIVE governed record. Inline policy terms reject. Contributions are {contributionRef: {module:'wasteSubmission',schema:'wasteSubmission',code}, receiptRef: {module:'wasteReceipt',schema:'wasteReceipt',code}, individualValue?}. The owner re-reads submission, original asset ownership when present, accepted receipt and policy. Current certificate holder never determines the beneficiary. Receipts must supply receivedFacts.materialCategoryCode and weightUnitOfMeasure or quantityUnitOfMeasure, together with receivedWeight or receivedQuantity. Missing canonical category/units fail; no guessed kg or equal split.

The owner snapshots the governed wasteMaterialValuePolicy record: {code, version, status:'ACTIVE', programCode, rewardTypeCode, currency, currencyScale, rewardScale, basisScale, commercialModel:'PROGRAM_FUNDED'|'CUSTOMER_SHARING', contributorShare:{numerator,denominator}, conversionRate:{numerator,denominator}, roundingMode:'DOWN'|'HALF_UP', categories:{categoryCode:{basis:'WEIGHT'|'QUANTITY',unitOfMeasure,weight}}}. Maintain these records through governed owner data; amendments use a new policy identity/version, not an environment override or inline adapter payload. Currency must match the valuation. Rational values and category weight are nonnegative/positive integer strings; conversionRate is reward units per currency unit. No rate, program, share or basis is defaulted. PROGRAM_FUNDED must have zero contributor share.

Individual confirmed values are retained first. Remaining batch value is distributed over unvalued contributions using accepted exact quantity/weight times recorded category weight. Deterministic largest remainders reconcile every monetary minor unit, with contribution code breaking equal remainders. Apply recorded share and conversion with exact integers and recorded rounding. Existing Loyalty amount primitives normalize reward precision. Duplicate contributions, missing units, negative/overprecise amounts, overallocated batches and changed policy replays reject.

Each contribution is claimed once for a batch before assessment creation. Claims persist after interrupted writes and are retried only with the same batch/evidence hash. This intentionally fails closed on a conflicting reassignment; do not erase claims to force a second credit. Partial receipt/contribution reassignment requires a separately governed reconciliation, not another batch with the same submission. A later certificate sale/gift/consumption has no effect on entitlement.

## Qualified recycler-payment adapter

CONFIG wasteMaterialValue.evidence.paymentProviderService implements readPayment({evidenceRef,batchRef,valuationRef,allocationCode}, {tenant,qualificationRef,signal}). Return {status:'CONFIRMED', synthetic:boolean, paymentRef, confirmationRef, batchRef, valuationRef, payerRef, payeeRef, currency, amount, coverage:[{allocationCode,amount}]}. The source must prove receipt of actual recycler funds and reconcile receipt uniqueness and allocations. No concrete external financial provider is qualified by this implementation. Payment Core bank-transfer preparation was inspected as request preparation, not proof of off-platform funds.

Payment currency, payer/payee, batch and valuation must match. Each covered allocation must be covered for its entire attributed material value. Partial batch payments may release a fully covered allocation; incomplete coverage of a single allocation stays pending. Union coverage, including pending credit intents, must not exceed the receipt's paid amount. Payment alone or value alone cannot release rewards. Original monetary value, source and policy remain immutable and traceable.

## Loyalty handoff and recovery

Before credit, freeze payment evidence and CREDIT_PENDING in the batch via CAS. Open the existing CUSTOMER or ENTERPRISE wallet through /wallets, then call /reward-earnings with recorded program/type/scale/amount, sourceType WASTE_MATERIAL_VALUE, sourceCode allocation.code, reasonCode RECYCLER_PAID_MATERIAL_VALUE and stable allocation.code + ':material-value' idempotency. Metadata labels Material value and preserves valuation, payment, original contribution/beneficiary and policy version. No random program, asset-wide settled flag or employee wallet is used.

Only matching returned ledger evidence marks COMPLETED, including source/target, reasonCode RECYCLER_PAID_MATERIAL_VALUE, metadata.sourceLabel Material value, evidenceHash, originalOwnerRef and paymentRef. Unsuccessful nested envelopes cannot disguise a successful result. Lost credit responses, failure after credit and concurrent retries retain the frozen source and re-invoke the existing idempotent Loyalty operation. No second source key, manual balance edit or compensation debit. Notification/consumer displays read owner evidence separately. A wallet response without a matching ledger record is not completion.

The existing remote /reward-earnings controller passes JSON body as request.payload. Loyalty must preserve metadata and reasonCode through operation normalization into its ledger; an isolated ledger builder does not verify that contract. Tests under wasteReward load the actual Loyalty controller, facade, wallet, reward-operation and transaction services and replace only network/generated repositories. They cover original Enterprise ownership, lost-response replay, transaction rollback, closed-wallet rejection and provenance readback. These tests require a qualified atomic transaction adapter in the synthetic harness. Runtime acceptance must independently qualify enabled Loyalty transactions for balance-plus-ledger writes; the optional non-atomic fallback is not sufficient evidence for payment-gated material release.

## Operations and verification

Decimal parsing/alignment/formatting reuse the canonical nCommon `exactAmount`
utility through the effective assessment owner's `amount()` accessor. Waste owns
admission and fixed-scale presentation, not a duplicate arithmetic implementation
or a dependency on an activated Loyalty amount service. Preserve leading-zero
input acceptance, nonnegative exact-string guards and evidenced precision.
`materialConfiguration.test.js` covers custom dispatch and unchanged wire values.

Loyalty handoff requires canonical internal authentication. Omit an Enterprise
header so the selected outgoing service token supplies its signed namespace.
Never substitute the source tenant, incoming Enterprise aliases or business owner,
and never rewrite original scopes or forward the participant bearer.
`materialTransportContract.test.js` exercises the real internal-header builder,
unchanged input aliases/scopes and missing-token refusal with no live transport.

Defaults, timeouts, bounds, remote transport and disabled provider selections live only in config/properties.js; validate intentional overrides. Synthetic fixtures require allowSynthetic and are always labelled; never present them as real payment. Permission imports, assignments, deployed module activation, UI composition, provider qualification and runtime/end-to-end acceptance are separate parent work. No live import, provider, database, server or release action belongs to focused unit verification.

Back up batch, contribution claims and payment claims together. One canonical payment receipt is bound to one batch; an adapter requiring cross-batch receipts must provide independently authoritative split receipt identities before qualification. The canonical wallet identity is frozen in the release before the first earning, so recovery cannot redirect an uncertain credit into a newly opened wallet. Retain pending releases for original-source reconciliation. Capacity rejects extra contributions before persistence. Operators inspect immutable evidence and release state through read APIs; no paid checkbox or editable reward balance is exposed. Later adapters implement these exact contracts through normal SERVICE/CONFIG composition and require the same positive and negative qualification tests.

Original ownership prefers the uniquely matched asset.originalOwnerRef by sourceSubmissionCode, with canonical submission originalOwnerRef/submitterRef when no asset exists. Conflicting original-owner evidence rejects. Current asset owner/status is never a beneficiary decision. Required local dependencies are wasteCore, wasteSubmission and wasteReceipt; Loyalty is reached through configured remote module authority. Explicit permission definitions live in data/manifest.json permissionCatalogue; importing definitions does not grant users or services access.
