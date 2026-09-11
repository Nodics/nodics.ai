# wasteImpact Contracts

Waste Impact owns metric/profile/result envelopes and provider execution.
`EXTERNAL_PROVIDER` profiles dispatch to the configured loader-owned service;
existing static, weight, and quantity formulas retain their synchronous behavior.
Consumers should await `calculate(request, runtimeContext)` for either path.

`request` contains sourceRef, profile, facts, evidenceRefs, idempotencyKey,
correlationId, and optional result envelope fields. `runtimeContext.tenant` is
trusted caller context, not a business schema field or HTTP-body override.

Providers implement `calculate(request, context)` returning a value or Promise.
Context contains immutable effective `settings`, trusted `runtimeContext`, and
an AbortSignal. Required response fields are `provider: { code, version,
isMock }`, `formulaVersion`, `calculationStatus`, and nonempty unique `metrics`
with metricCode, finite nonnegative decimal value, and unitOfMeasure.

Mock responses normalize to ESTIMATED even if a caller requests confirmation.
Every normalized response sets publicClaimAllowed false. Confirmation alone
never establishes certification, credit issuance, or eligibility for rewards.
Calculation input, applied factors, method/version, and fingerprints preserve
assessment provenance; arbitrary provider metadata and secrets are omitted.

No persistence, retry, ledger, reservation, issuance, or idempotency store is
introduced. Callers retain result persistence and duplicate-command ownership;
adapters receive caller idempotency and correlation identifiers. Missing,
invalid, failed, or timed-out providers yield typed errors or explicitly FAILED
results according to configured failureMode. They never fall back to mock.

The [canonical guide](../../../../../nodics.docs/docs/pages/nodics.waste/impact-providers.md)
contains exact configuration, protocol, failure, recovery and validation examples.

## Environmental assessment disclosure

`wasteImpact.calculation.environmentalAssessment` optionally maps provider metric
codes to customer-facing indicators. It is disabled in framework defaults;
eWaste contributes 11 mappings and evidence requirements. Mappings carry labels,
units and display semantics, never coefficients or calculated values. They do not
replace the metric catalogue, provider or result authority. Partners override
mappings through existing CONFIG and provide calculations through the same SERVICE
adapter. A maximum of 32 unique mappings and bounded strings is enforced.

Results add `metadata.environmentalAssessment` with version, timestamp, per-indicator
value/unit/status/basis/requirements, input and factor provenance, methodology and
assessment context. An omitted metric is `null` / `NOT_ASSESSED`, never zero;
explicit zero remains a calculated value. Mock indicators are `ILLUSTRATIVE`.
Failed calculations disclose `FAILED`. A mapped unit mismatch is an invalid
provider result. Negative provider values are allowed only for an explicitly
`allowNegative: true` mapping with the exact declared unit (for example net
emissions benefit); other metrics retain the nonnegative contract.

Carbon-credit eligibility and issuance remain `NOT_ASSESSED` with null issued
quantity and registry reference. No kg-to-credit conversion, issuance, reward or
public claim follows from this envelope, even for CONFIRMED assessments. Provider
credit payloads are not accepted. Any future registry integration belongs to its
own governed capability. Existing asset `impactRef` continues to reference the
owner-persisted impact result; do not copy environmental balances into assets.

The mapping version identifies disclosure semantics; the existing formula,
provider, parameter/input fingerprints identify calculation provenance. Optional
methodologyRef, assessmentRef, geography, baselineScenario, treatmentScenario,
systemBoundary, referenceYear and factorDatasetRef are bounded provider claims,
not values extracted from a photo or certification by Nodics.

## Immutable assessment history and acceptance

`DefaultWasteImpactAssessmentService` owns persisted reassessment and acceptance
operations. It composes the existing calculator and generated Waste repositories;
provider adapters still perform no persistence. Staff commands resolve an approved
submission and exactly one associated asset, then enforce Profile permission and
collection-point scope. Reads require `waste.review.queue.read`, reassessment
requires `waste.verification.record`, and acceptance requires `waste.review.approve`.

A reassessment reads stored reviewed facts and current trusted provider configuration.
It creates a new `wasteImpactResult` with asset reference, previous accepted reference,
input facts, source revision, reason, actor and command fingerprint. It never changes
the accepted `asset.impactRef`, original `metadata.approvedEstimate`, or reward state.
An explicit acceptance changes `impactRef` and its read snapshot `acceptedEstimate`,
while preserving original approval evidence. `wasteImpactSelection` records each
acceptance. Results and selections are read-only in generic schema authoring; assets
must be mutated through their owning lifecycle operations.

Exact asset revisions and actor-bound idempotency keys serialize commands. An
asset-persisted pending command freezes the result/event before downstream persistence.
Recovery completes that snapshot even after provider configuration changes. A failed
provider result remains visible in history but cannot be accepted. Selection requires
completed original reward settlement; changed input facts reject a stale candidate.
Replaying an old successful selection never restores it over a newer accepted result.

History is paginated (20 records per page), includes the legacy approval result and
returns the accepted result independently of the current page. Customer callers must
first authorize current asset ownership before calling `historyForAsset`; staff
callers use the scoped `history` entry point. The public projection excludes actor,
command key and raw input facts. No reassessment or acceptance issues credits,
revalues a wallet, or changes a settled reward. The original approval result remains
the reward settlement source even after subsequent assessment selection.

Provider and dataset identity are separate. Preserve provider code/version,
formula version, source dataset/version, original and normalized factors, geography,
baseline, treatment, boundary, weight source/range/confidence and timestamps.
`CARBON_EQUIVALENT_TCO2E` is a unit conversion metric, never an issued-credit quantity.
Electronic WARM coefficients and mappings belong to the eWaste provider adapter.
